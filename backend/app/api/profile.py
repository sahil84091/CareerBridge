from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.entities import User, Profile, CareerRole
from backend.app.schemas.schemas import ProfileResponse, ProfileUpdateRequest

router = APIRouter(prefix="/api/profile", tags=["Profile"])


@router.get("", response_model=ProfileResponse)
def get_profile(user_id: str = "demo_user_01", db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if not profile:
        profile = db.query(Profile).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    user = profile.user
    return ProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        full_name=user.full_name if user else "Candidate",
        email=user.email if user else "user@example.com",
        bio=profile.bio,
        current_title=profile.current_title,
        target_role_id=profile.target_role_id,
        target_role_title=profile.target_role_title or (profile.target_role.title if profile.target_role else "Full Stack Developer"),
        experience_level=profile.experience_level,
        education_level=profile.education_level,
        github_url=profile.github_url,
        linkedin_url=profile.linkedin_url,
    )


@router.put("", response_model=ProfileResponse)
def update_profile(
    payload: ProfileUpdateRequest,
    user_id: str = "demo_user_01",
    db: Session = Depends(get_db),
):
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if not profile:
        profile = db.query(Profile).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    if payload.bio is not None:
        profile.bio = payload.bio
    if payload.current_title is not None:
        profile.current_title = payload.current_title
    if payload.experience_level is not None:
        profile.experience_level = payload.experience_level
    if payload.education_level is not None:
        profile.education_level = payload.education_level
    if payload.github_url is not None:
        profile.github_url = payload.github_url
    if payload.linkedin_url is not None:
        profile.linkedin_url = payload.linkedin_url

    if payload.target_role_id is not None:
        role = db.query(CareerRole).filter(CareerRole.id == payload.target_role_id).first()
        if role:
            profile.target_role_id = role.id
            profile.target_role_title = role.title

    db.commit()
    db.refresh(profile)

    user = profile.user
    return ProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        full_name=user.full_name if user else "Candidate",
        email=user.email if user else "user@example.com",
        bio=profile.bio,
        current_title=profile.current_title,
        target_role_id=profile.target_role_id,
        target_role_title=profile.target_role_title,
        experience_level=profile.experience_level,
        education_level=profile.education_level,
        github_url=profile.github_url,
        linkedin_url=profile.linkedin_url,
    )
