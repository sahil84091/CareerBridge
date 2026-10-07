from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.models.entities import CareerRole, Profile, User
from backend.app.schemas.schemas import ProfileResponse, ProfileUpdateRequest
from backend.app.security import get_current_user

router = APIRouter(prefix="/api/profile", tags=["Profile"])


def _profile_for(db: Session, user: User) -> Profile:
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if not profile:
        profile = Profile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


def _response(profile: Profile, user: User) -> ProfileResponse:
    return ProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        full_name=user.full_name,
        email=user.email,
        bio=profile.bio,
        current_title=profile.current_title,
        target_role_id=profile.target_role_id,
        target_role_title=profile.target_role_title or (profile.target_role.title if profile.target_role else None),
        experience_level=profile.experience_level,
        education_level=profile.education_level,
        github_url=profile.github_url,
        linkedin_url=profile.linkedin_url,
    )


@router.get("", response_model=ProfileResponse)
def get_profile(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return _response(_profile_for(db, user), user)


@router.put("", response_model=ProfileResponse)
def update_profile(
    payload: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    profile = _profile_for(db, user)
    for field in ("bio", "current_title", "experience_level", "education_level", "github_url", "linkedin_url"):
        value = getattr(payload, field)
        if value is not None:
            setattr(profile, field, value)
    if payload.target_role_id is not None:
        role = db.query(CareerRole).filter(CareerRole.id == payload.target_role_id).first()
        if not role:
            raise HTTPException(status_code=404, detail="Career role not found")
        profile.target_role_id = role.id
        profile.target_role_title = role.title
    elif payload.target_role_title is not None:
        profile.target_role_title = payload.target_role_title
    db.commit()
    db.refresh(profile)
    return _response(profile, user)
