from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.entities import User, Profile, CareerRole, SkillGap, Roadmap, Opportunity, UserSkill
from backend.app.schemas.schemas import (
    DashboardStatsResponse,
    UserSummary,
    ProfileResponse,
    CareerRoleResponse,
    RoleSkillItem,
    OpportunityMatchItem,
    UserSkillItem,
)
from backend.app.ai.opportunity_matcher import opportunity_matcher

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardStatsResponse)
def get_dashboard_summary(user_id: str = "demo_user_01", db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = db.query(User).first()
        if not user:
            raise HTTPException(status_code=404, detail="No user found")
        user_id = user.id

    profile = user.profile
    if not profile:
        profile = Profile(user_id=user.id, target_role_title="Full Stack Developer")
        db.add(profile)
        db.commit()
        db.refresh(profile)

    target_role = None
    if profile.target_role_id:
        target_role = db.query(CareerRole).filter(CareerRole.id == profile.target_role_id).first()
    if not target_role:
        target_role = db.query(CareerRole).filter(CareerRole.title == "Full Stack Developer").first()
    if not target_role:
        target_role = db.query(CareerRole).first()

    target_role_res = None
    if target_role:
        target_role_res = CareerRoleResponse(
            id=target_role.id,
            title=target_role.title,
            category=target_role.category,
            description=target_role.description,
            average_salary=target_role.average_salary,
            market_demand=target_role.market_demand,
            required_skills=[
                RoleSkillItem(
                    skill_name=rs.skill.name,
                    category=rs.skill.category,
                    importance=rs.importance,
                    weight=rs.weight,
                )
                for rs in target_role.required_skills
            ],
        )

    # Latest SkillGap
    skill_gap = (
        db.query(SkillGap)
        .filter(SkillGap.user_id == user_id)
        .order_by(SkillGap.analyzed_at.desc())
        .first()
    )

    readiness = skill_gap.readiness_score if skill_gap else 68.0
    matched_count = len(skill_gap.matched_skills) if skill_gap else 12
    partial_count = len(skill_gap.partial_skills) if skill_gap else 4
    missing_count = len(skill_gap.missing_skills) if skill_gap else 5
    priority_skills = (
        skill_gap.priority_skills
        if skill_gap and skill_gap.priority_skills
        else ["Docker", "REST API", "AWS", "Node.js", "React"]
    )

    # Roadmap progress
    roadmap = (
        db.query(Roadmap)
        .filter(Roadmap.user_id == user_id)
        .order_by(Roadmap.generated_at.desc())
        .first()
    )
    roadmap_progress = roadmap.current_progress if roadmap else 35.0

    # User skills
    user_skills = db.query(UserSkill).filter(UserSkill.user_id == user_id).all()
    user_skill_names = [us.skill.name for us in user_skills]
    recent_skills = [
        UserSkillItem(
            id=us.id,
            skill_name=us.skill.name,
            category=us.skill.category,
            proficiency=us.proficiency,
            verified=us.verified,
            source=us.source,
        )
        for us in user_skills[:8]
    ]

    # Opportunities
    raw_opps = db.query(Opportunity).limit(4).all()
    matched_opps = []
    for opp in raw_opps:
        match_data = opportunity_matcher.match_opportunity(
            user_skills=user_skill_names,
            opportunity={
                "id": opp.id,
                "title": opp.title,
                "company": opp.company,
                "location": opp.location,
                "type": opp.type,
                "salary_range": opp.salary_range,
                "experience_level": opp.experience_level,
                "description": opp.description,
                "apply_url": opp.apply_url,
                "required_skills": opp.required_skills or [],
                "preferred_skills": opp.preferred_skills or [],
            },
        )
        matched_opps.append(OpportunityMatchItem(**match_data))

    matched_opps.sort(key=lambda x: -x.match_score)

    return DashboardStatsResponse(
        user=UserSummary(id=user.id, email=user.email, full_name=user.full_name),
        profile=ProfileResponse(
            id=profile.id,
            user_id=profile.user_id,
            full_name=user.full_name,
            email=user.email,
            bio=profile.bio,
            current_title=profile.current_title,
            target_role_id=profile.target_role_id,
            target_role_title=profile.target_role_title or "Full Stack Developer",
            experience_level=profile.experience_level,
            education_level=profile.education_level,
            github_url=profile.github_url,
            linkedin_url=profile.linkedin_url,
        ),
        target_role=target_role_res,
        readiness_score=readiness,
        skill_counts={
            "matched": matched_count,
            "partial": partial_count,
            "missing": missing_count,
        },
        top_skill_gaps=priority_skills,
        roadmap_progress=roadmap_progress,
        recommended_opportunities=matched_opps,
        recent_skills=recent_skills,
    )
