from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend.app.database.session import get_db
from backend.app.models.entities import User, CareerRole, Roadmap, RoadmapItem, SkillGap, Profile
from backend.app.schemas.schemas import RoadmapResponse, RoadmapPhaseItem
from backend.app.ai.roadmap_generator import roadmap_generator

router = APIRouter(prefix="/api/roadmap", tags=["Career Roadmap"])


class RoadmapItemStatusUpdate(BaseModel):
    status: str  # completed, in_progress, pending


def _format_roadmap(roadmap: Roadmap) -> RoadmapResponse:
    phases = [
        RoadmapPhaseItem(
            phase_number=item.phase_number,
            phase_name=item.phase_name,
            title=item.title,
            description=item.description,
            skills=item.skills or [],
            milestone_projects=item.milestone_projects or [],
            learning_goals=item.learning_goals or [],
            status=item.status,
        )
        for item in sorted(roadmap.items, key=lambda x: x.phase_number)
    ]
    return RoadmapResponse(
        id=roadmap.id,
        role_id=roadmap.role_id,
        role_title=roadmap.role.title if roadmap.role else "Full Stack Developer",
        target_duration=roadmap.target_duration,
        current_progress=roadmap.current_progress,
        phases=phases,
    )


@router.post("/generate", response_model=RoadmapResponse)
def generate_roadmap(
    role_id: Optional[str] = None,
    user_id: str = "demo_user_01",
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = db.query(User).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user_id = user.id

    role = None
    if role_id:
        role = db.query(CareerRole).filter(CareerRole.id == role_id).first()

    if not role and user.profile and user.profile.target_role_id:
        role = db.query(CareerRole).filter(CareerRole.id == user.profile.target_role_id).first()

    if not role:
        role = db.query(CareerRole).filter(CareerRole.title == "Full Stack Developer").first()
        if not role:
            role = db.query(CareerRole).first()

    # Look for existing skill gap for this role
    skill_gap = (
        db.query(SkillGap)
        .filter(SkillGap.user_id == user_id, SkillGap.role_id == role.id)
        .order_by(SkillGap.analyzed_at.desc())
        .first()
    )

    missing_names = [m.get("name") for m in skill_gap.missing_skills] if skill_gap else ["Docker", "REST API", "AWS"]
    partial_names = [p.get("name") for p in skill_gap.partial_skills] if skill_gap else ["React", "Node.js"]
    matched_names = [m.get("name") for m in skill_gap.matched_skills] if skill_gap else ["JavaScript", "HTML", "CSS", "Git"]

    phases_data = roadmap_generator.generate_roadmap(
        role_title=role.title,
        missing_skills=missing_names,
        partial_skills=partial_names,
        matched_skills=matched_names,
    )

    # Remove previous roadmap for this role to recreate
    old_roadmaps = db.query(Roadmap).filter(Roadmap.user_id == user_id, Roadmap.role_id == role.id).all()
    for old_r in old_roadmaps:
        db.delete(old_r)
    db.flush()

    roadmap = Roadmap(
        user_id=user_id,
        role_id=role.id,
        title=f"{role.title} Career Roadmap",
        target_duration="12 - 16 Weeks",
        current_progress=20.0,
    )
    db.add(roadmap)
    db.flush()

    for p in phases_data:
        item = RoadmapItem(
            roadmap_id=roadmap.id,
            phase_number=p["phase_number"],
            phase_name=p["phase_name"],
            title=p["title"],
            description=p["description"],
            skills=p["skills"],
            milestone_projects=p["milestone_projects"],
            learning_goals=p["learning_goals"],
            status=p["status"],
            order_index=p["phase_number"],
        )
        db.add(item)

    db.commit()
    db.refresh(roadmap)

    return _format_roadmap(roadmap)


@router.get("/current", response_model=RoadmapResponse)
def get_current_roadmap(user_id: str = "demo_user_01", db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = db.query(User).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user_id = user.id

    roadmap = (
        db.query(Roadmap)
        .filter(Roadmap.user_id == user_id)
        .order_by(Roadmap.generated_at.desc())
        .first()
    )

    if not roadmap:
        return generate_roadmap(None, user_id=user_id, db=db)

    return _format_roadmap(roadmap)
