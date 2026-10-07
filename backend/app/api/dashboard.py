from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.models.entities import CareerRole, Profile, Roadmap, SkillGap, User, UserSkill
from backend.app.schemas.schemas import (
    CareerRoleResponse,
    DashboardStatsResponse,
    OpportunityMatchItem,
    ProfileResponse,
    RoleSkillItem,
    UserSkillItem,
    UserSummary,
)
from backend.app.security import get_current_user
from backend.app.services.adzuna import cached_matched_opportunities

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardStatsResponse)
def get_dashboard_summary(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if not profile:
        profile = Profile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    target_role = db.query(CareerRole).filter(CareerRole.id == profile.target_role_id).first() if profile.target_role_id else None

    skill_gap = None
    if target_role:
        skill_gap = db.query(SkillGap).filter(
            SkillGap.user_id == user.id, SkillGap.role_id == target_role.id
        ).order_by(SkillGap.analyzed_at.desc()).first()
    roadmap = db.query(Roadmap).filter(Roadmap.user_id == user.id).order_by(Roadmap.generated_at.desc()).first()
    user_skills = db.query(UserSkill).filter(UserSkill.user_id == user.id).order_by(UserSkill.id).all()
    role_response = None
    if target_role:
        role_response = CareerRoleResponse(
            id=target_role.id,
            title=target_role.title,
            category=target_role.category,
            description=target_role.description,
            average_salary=target_role.average_salary,
            market_demand=target_role.market_demand,
            required_skills=[RoleSkillItem(
                skill_name=rs.skill.name, category=rs.skill.category,
                importance=rs.importance, weight=rs.weight,
            ) for rs in target_role.required_skills],
        )
    gaps = skill_gap
    profile_response = ProfileResponse(
        id=profile.id,
        user_id=user.id,
        full_name=user.full_name,
        email=user.email,
        bio=profile.bio,
        current_title=profile.current_title,
        target_role_id=profile.target_role_id,
        target_role_title=profile.target_role_title or (target_role.title if target_role else None),
        experience_level=profile.experience_level,
        education_level=profile.education_level,
        github_url=profile.github_url,
        linkedin_url=profile.linkedin_url,
    )
    return DashboardStatsResponse(
        user=UserSummary(id=user.id, email=user.email, full_name=user.full_name),
        profile=profile_response,
        target_role=role_response,
        readiness_score=gaps.readiness_score if gaps else 0.0,
        skill_counts={
            "matched": len(gaps.matched_skills or []) if gaps else 0,
            "partial": len(gaps.partial_skills or []) if gaps else 0,
            "missing": len(gaps.missing_skills or []) if gaps else 0,
        },
        top_skill_gaps=gaps.priority_skills or [] if gaps else [],
        roadmap_progress=roadmap.current_progress if roadmap else 0.0,
        recommended_opportunities=[OpportunityMatchItem(**item) for item in cached_matched_opportunities(db, user)],
        recent_skills=[UserSkillItem(
            id=entry.id, skill_name=entry.skill.name, category=entry.skill.category,
            proficiency=entry.proficiency, verified=entry.verified, source=entry.source,
        ) for entry in user_skills[:8]],
    )
