from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.entities import Skill, UserSkill, User
from backend.app.schemas.schemas import SkillItem, UserSkillItem, AddUserSkillRequest
from backend.app.ai.taxonomy import taxonomy

router = APIRouter(prefix="/api/skills", tags=["Skills"])


@router.get("", response_model=List[SkillItem])
def list_all_skills(db: Session = Depends(get_db)):
    skills = db.query(Skill).order_by(Skill.name).all()
    return [
        SkillItem(
            id=s.id,
            name=s.name,
            category=s.category,
            description=s.description,
            importance=s.importance,
            aliases=s.aliases or [],
        )
        for s in skills
    ]


@router.get("/user", response_model=List[UserSkillItem])
def get_user_skills(user_id: str = "demo_user_01", db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = db.query(User).first()
        if not user:
            return []

    user_skills = db.query(UserSkill).filter(UserSkill.user_id == user.id).all()
    return [
        UserSkillItem(
            id=us.id,
            skill_name=us.skill.name,
            category=us.skill.category,
            proficiency=us.proficiency,
            verified=us.verified,
            source=us.source,
        )
        for us in user_skills
    ]


@router.post("/user", response_model=UserSkillItem)
def add_user_skill(
    payload: AddUserSkillRequest,
    user_id: str = "demo_user_01",
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = db.query(User).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user_id = user.id

    canonical_name = taxonomy.normalize(payload.skill_name) or payload.skill_name
    skill_obj = db.query(Skill).filter(Skill.name.ilike(canonical_name)).first()
    if not skill_obj:
        skill_obj = Skill(
            name=canonical_name,
            category="Technical",
            importance="Medium",
        )
        db.add(skill_obj)
        db.flush()

    user_skill = (
        db.query(UserSkill)
        .filter(UserSkill.user_id == user_id, UserSkill.skill_id == skill_obj.id)
        .first()
    )

    if user_skill:
        user_skill.proficiency = payload.proficiency or "Moderate"
    else:
        user_skill = UserSkill(
            user_id=user_id,
            skill_id=skill_obj.id,
            proficiency=payload.proficiency or "Moderate",
            verified=False,
            source="Manual Addition",
        )
        db.add(user_skill)

    db.commit()
    db.refresh(user_skill)

    return UserSkillItem(
        id=user_skill.id,
        skill_name=skill_obj.name,
        category=skill_obj.category,
        proficiency=user_skill.proficiency,
        verified=user_skill.verified,
        source=user_skill.source,
    )


@router.delete("/user/{skill_id}")
def delete_user_skill(
    skill_id: str,
    user_id: str = "demo_user_01",
    db: Session = Depends(get_db),
):
    us = (
        db.query(UserSkill)
        .filter(UserSkill.id == skill_id)
        .first()
    )
    if not us:
        raise HTTPException(status_code=404, detail="Skill not found for user")

    db.delete(us)
    db.commit()
    return {"status": "success", "message": "Skill removed"}
