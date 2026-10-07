from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.entities import User, CareerRole, SkillGap, UserSkill, Profile
from backend.app.schemas.schemas import SkillGapAnalysisRequest, SkillGapAnalysisResponse, SkillGapItem
from backend.app.ai.skill_gap_engine import skill_gap_engine
from backend.app.security import get_current_user

router = APIRouter(prefix="/api/skill-gap", tags=["Skill Gap Analysis"])


@router.post("/analyze", response_model=SkillGapAnalysisResponse)
def analyze_skill_gap(
    payload: SkillGapAnalysisRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Determine target role
    role = None
    if payload.role_id:
        role = db.query(CareerRole).filter(CareerRole.id == payload.role_id).first()
        if not role:
            raise HTTPException(status_code=404, detail="Career role not found")

    if not role and user.profile and user.profile.target_role_id:
        role = db.query(CareerRole).filter(CareerRole.id == user.profile.target_role_id).first()

    if not role:
        raise HTTPException(status_code=409, detail="Choose a target career before analyzing your skill gap")

    # Fetch user's skills
    user_skills_records = db.query(UserSkill).filter(UserSkill.user_id == user.id).all()
    user_skills_data = [
        {"skill_name": us.skill.name, "proficiency": us.proficiency}
        for us in user_skills_records
    ]

    # Fetch role requirements
    role_skills_data = [
        {
            "skill_name": rs.skill.name,
            "category": rs.skill.category,
            "importance": rs.importance,
            "weight": rs.weight,
        }
        for rs in role.required_skills
    ]

    analysis = skill_gap_engine.analyze_gap(
        user_skills=user_skills_data,
        role_skills=role_skills_data,
        role_title=role.title,
    )

    # Save or update record in database
    existing_gap = (
        db.query(SkillGap)
        .filter(SkillGap.user_id == user.id, SkillGap.role_id == role.id)
        .first()
    )
    if existing_gap:
        existing_gap.readiness_score = analysis["readiness_score"]
        existing_gap.matched_skills = analysis["matched_skills"]
        existing_gap.partial_skills = analysis["partial_skills"]
        existing_gap.missing_skills = analysis["missing_skills"]
        existing_gap.priority_skills = analysis["priority_skills"]
    else:
        existing_gap = SkillGap(
            user_id=user.id,
            role_id=role.id,
            readiness_score=analysis["readiness_score"],
            matched_skills=analysis["matched_skills"],
            partial_skills=analysis["partial_skills"],
            missing_skills=analysis["missing_skills"],
            priority_skills=analysis["priority_skills"],
        )
        db.add(existing_gap)

    # Update profile target role if changed
    if user.profile:
        user.profile.target_role_id = role.id
        user.profile.target_role_title = role.title

    db.commit()

    return SkillGapAnalysisResponse(
        role_id=role.id,
        role_title=role.title,
        readiness_score=analysis["readiness_score"],
        matched_skills=[SkillGapItem(**s) for s in analysis["matched_skills"]],
        partial_skills=[SkillGapItem(**s) for s in analysis["partial_skills"]],
        missing_skills=[SkillGapItem(**s) for s in analysis["missing_skills"]],
        priority_skills=analysis["priority_skills"],
        total_required=analysis["total_required"],
        matched_count=analysis["matched_count"],
        partial_count=analysis["partial_count"],
        missing_count=analysis["missing_count"],
    )


@router.get("/current", response_model=SkillGapAnalysisResponse)
def get_current_skill_gap(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return analyze_skill_gap(SkillGapAnalysisRequest(), db=db, user=user)
