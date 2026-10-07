from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.entities import CareerRole, User, UserSkill
from backend.app.schemas.schemas import CareerRoleResponse, RoleSkillItem
from backend.app.ai.taxonomy import taxonomy

router = APIRouter(prefix="/api/careers", tags=["Career Roles"])


def _format_career_role(role: CareerRole) -> CareerRoleResponse:
    skills = [
        RoleSkillItem(
            skill_name=rs.skill.name,
            category=rs.skill.category,
            importance=rs.importance,
            weight=rs.weight,
        )
        for rs in role.required_skills
    ]
    return CareerRoleResponse(
        id=role.id,
        title=role.title,
        category=role.category,
        description=role.description,
        average_salary=role.average_salary,
        market_demand=role.market_demand,
        required_skills=skills,
    )


@router.get("", response_model=List[CareerRoleResponse])
def get_all_careers(db: Session = Depends(get_db)):
    roles = db.query(CareerRole).all()
    return [_format_career_role(r) for r in roles]


@router.get("/{role_id}", response_model=CareerRoleResponse)
def get_career_by_id(role_id: str, db: Session = Depends(get_db)):
    role = db.query(CareerRole).filter(CareerRole.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Career role not found")
    return _format_career_role(role)


@router.post("/recommend")
def recommend_careers(user_id: str = "demo_user_01", db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = db.query(User).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

    user_skills = set(
        s.skill.name.lower()
        for s in db.query(UserSkill).filter(UserSkill.user_id == user.id).all()
    )

    roles = db.query(CareerRole).all()
    recommendations = []

    for role in roles:
        req_skills = [rs.skill.name for rs in role.required_skills]
        matched = [s for s in req_skills if s.lower() in user_skills]
        score = round((len(matched) / len(req_skills) * 100) if req_skills else 50, 1)

        recommendations.append({
            "role_id": role.id,
            "title": role.title,
            "category": role.category,
            "average_salary": role.average_salary,
            "match_score": score,
            "matched_skills": matched,
            "missing_count": len(req_skills) - len(matched),
            "explanation": f"Based on your proficiency in {', '.join(matched[:3])}, you align well with {role.title}.",
        })

    recommendations.sort(key=lambda x: -x["match_score"])
    return {"recommendations": recommendations}
