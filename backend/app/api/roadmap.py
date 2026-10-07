from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.app.ai.gemini import gemini_service
from backend.app.ai.roadmap_generator import roadmap_generator
from backend.app.database.session import get_db
from backend.app.models.entities import CareerRole, Profile, Roadmap, RoadmapItem, SkillGap, User, UserSkill
from backend.app.schemas.schemas import RoadmapPhaseItem, RoadmapResponse
from backend.app.security import get_current_user

router = APIRouter(prefix="/api/roadmap", tags=["Career Roadmap"])


class RoadmapItemUpdate(BaseModel):
    status: Optional[Literal["completed", "in_progress", "pending"]] = None
    completed_goals: Optional[list[str]] = Field(default=None, max_length=100)


def _format_roadmap(roadmap: Roadmap) -> RoadmapResponse:
    phases = [RoadmapPhaseItem(
        phase_number=item.phase_number,
        phase_name=item.phase_name,
        title=item.title,
        description=item.description,
        skills=item.skills or [],
        milestone_projects=item.milestone_projects or [],
        learning_goals=item.learning_goals or [],
        completed_goals=item.completed_goals or [],
        status=item.status,
        id=item.id,
    ) for item in sorted(roadmap.items, key=lambda x: x.phase_number)]
    return RoadmapResponse(
        id=roadmap.id,
        role_id=roadmap.role_id,
        role_title=roadmap.role.title if roadmap.role else "Career role",
        target_duration=roadmap.target_duration,
        current_progress=roadmap.current_progress,
        phases=phases,
    )


def _role_for(db: Session, user: User, role_id: str | None) -> CareerRole:
    if role_id:
        role = db.query(CareerRole).filter(CareerRole.id == role_id).first()
        if not role:
            raise HTTPException(status_code=404, detail="Career role not found")
        return role
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    role = db.query(CareerRole).filter(CareerRole.id == profile.target_role_id).first() if profile and profile.target_role_id else None
    if not role:
        raise HTTPException(status_code=409, detail="Choose a target career before generating a roadmap")
    return role


def _create_roadmap(db: Session, user: User, role_id: str | None) -> Roadmap:
    role = _role_for(db, user, role_id)
    gap = db.query(SkillGap).filter(
        SkillGap.user_id == user.id, SkillGap.role_id == role.id
    ).order_by(SkillGap.analyzed_at.desc()).first()
    if gap:
        missing = [item.get("name", "") for item in (gap.missing_skills or [])]
        partial = [item.get("name", "") for item in (gap.partial_skills or [])]
        matched = [item.get("name", "") for item in (gap.matched_skills or [])]
    else:
        from backend.app.ai.skill_gap_engine import skill_gap_engine
        skills = [{"skill_name": s.skill.name, "proficiency": s.proficiency}
                  for s in db.query(UserSkill).filter(UserSkill.user_id == user.id).all()]
        role_skills = [{"skill_name": rs.skill.name, "category": rs.skill.category,
                        "importance": rs.importance, "weight": rs.weight} for rs in role.required_skills]
        calculated = skill_gap_engine.analyze_gap(skills, role_skills, role.title)
        missing = [item["name"] for item in calculated["missing_skills"]]
        partial = [item["name"] for item in calculated["partial_skills"]]
        matched = [item["name"] for item in calculated["matched_skills"]]
    phases = gemini_service.generate_roadmap(role.title, missing, partial, matched)
    phases = phases or roadmap_generator.generate_roadmap(role.title, missing, partial, matched)
    roadmap = Roadmap(user_id=user.id, role_id=role.id, title=f"{role.title} Career Roadmap", target_duration="12–16 Weeks")
    db.add(roadmap)
    db.flush()
    for phase in phases:
        db.add(RoadmapItem(
            roadmap_id=roadmap.id,
            phase_number=phase["phase_number"],
            phase_name=phase["phase_name"],
            title=phase["title"],
            description=phase["description"],
            skills=phase.get("skills", []),
            milestone_projects=phase.get("milestone_projects", []),
            learning_goals=phase.get("learning_goals", []),
            completed_goals=[],
            status="pending",
            order_index=phase["phase_number"],
        ))
    db.commit()
    db.refresh(roadmap)
    return roadmap


@router.post("/generate", response_model=RoadmapResponse)
def generate_roadmap(
    role_id: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    role = _role_for(db, user, role_id)
    for previous in db.query(Roadmap).filter(Roadmap.user_id == user.id, Roadmap.role_id == role.id).all():
        db.delete(previous)
    db.flush()
    roadmap = _create_roadmap(db, user, role.id)
    return _format_roadmap(roadmap)


@router.get("/current", response_model=RoadmapResponse)
def get_current_roadmap(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    roadmap = db.query(Roadmap).filter(Roadmap.user_id == user.id).order_by(Roadmap.generated_at.desc()).first()
    if not roadmap:
        roadmap = _create_roadmap(db, user, None)
    return _format_roadmap(roadmap)


@router.patch("/items/{item_id}", response_model=RoadmapResponse)
def update_roadmap_item(
    item_id: str,
    payload: RoadmapItemUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    item = db.query(RoadmapItem).join(Roadmap).filter(
        RoadmapItem.id == item_id, Roadmap.user_id == user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Roadmap phase not found")
    if payload.completed_goals is not None:
        allowed = set(item.learning_goals or [])
        if not set(payload.completed_goals).issubset(allowed):
            raise HTTPException(status_code=422, detail="Completed goals must belong to this roadmap phase")
        item.completed_goals = list(dict.fromkeys(payload.completed_goals))
        if item.learning_goals and len(item.completed_goals) == len(item.learning_goals):
            item.status = "completed"
        elif item.completed_goals:
            item.status = "in_progress"
        else:
            item.status = "pending"
    if payload.status is not None:
        item.status = payload.status
    roadmap = item.roadmap
    total = sum(len(phase.learning_goals or []) for phase in roadmap.items)
    done = sum(len(phase.completed_goals or []) for phase in roadmap.items)
    if total:
        roadmap.current_progress = round(done / total * 100, 1)
    elif roadmap.items:
        roadmap.current_progress = round(sum(phase.status == "completed" for phase in roadmap.items) / len(roadmap.items) * 100, 1)
    db.commit()
    db.refresh(roadmap)
    return _format_roadmap(roadmap)
