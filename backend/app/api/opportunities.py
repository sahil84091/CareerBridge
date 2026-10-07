from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.entities import Opportunity, User, UserSkill
from backend.app.schemas.schemas import OpportunityMatchItem
from backend.app.ai.opportunity_matcher import opportunity_matcher

router = APIRouter(prefix="/api/opportunities", tags=["Opportunities"])


@router.get("", response_model=List[OpportunityMatchItem])
def get_matched_opportunities(
    role_filter: Optional[str] = None,
    type_filter: Optional[str] = None,
    user_id: str = "demo_user_01",
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = db.query(User).first()

    # User's current skills
    user_skill_names = []
    if user:
        user_skill_names = [
            us.skill.name
            for us in db.query(UserSkill).filter(UserSkill.user_id == user.id).all()
        ]

    query = db.query(Opportunity)
    if type_filter and type_filter.lower() != "all":
        query = query.filter(Opportunity.type.ilike(f"%{type_filter}%"))

    opportunities = query.all()
    results = []

    for opp in opportunities:
        match_info = opportunity_matcher.match_opportunity(
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
        results.append(OpportunityMatchItem(**match_info))

    # Sort opportunities by match_score descending
    results.sort(key=lambda x: -x.match_score)
    return results
