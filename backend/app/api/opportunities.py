from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.models.entities import User
from backend.app.schemas.schemas import OpportunityMatchItem
from backend.app.security import get_current_user
from backend.app.services.adzuna import matched_opportunities

router = APIRouter(prefix="/api/opportunities", tags=["Opportunities"])


@router.get("", response_model=List[OpportunityMatchItem])
def get_matched_opportunities(
    role_filter: Optional[str] = Query(default=None, max_length=120),
    type_filter: Optional[str] = Query(default=None, max_length=40),
    location: Optional[str] = Query(default=None, max_length=120),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return matched_opportunities(db, user, role_filter, type_filter, location)
