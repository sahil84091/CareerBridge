from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.models.entities import User, UserPreference
from backend.app.schemas.schemas import UserPreferenceResponse, UserPreferenceUpdate
from backend.app.security import get_current_user

router = APIRouter(prefix="/api/preferences", tags=["Preferences"])


@router.get("", response_model=UserPreferenceResponse)
def get_preferences(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    record = db.query(UserPreference).filter(UserPreference.user_id == user.id).first()
    return UserPreferenceResponse(
        salary_expectation=record.salary_expectation if record else None,
        remote_only=record.remote_only if record else False,
    )


@router.put("", response_model=UserPreferenceResponse)
def update_preferences(
    payload: UserPreferenceUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    record = db.query(UserPreference).filter(UserPreference.user_id == user.id).first()
    if not record:
        record = UserPreference(user_id=user.id)
        db.add(record)
    record.salary_expectation = payload.salary_expectation
    record.remote_only = payload.remote_only
    db.commit()
    return UserPreferenceResponse(salary_expectation=record.salary_expectation, remote_only=record.remote_only)
