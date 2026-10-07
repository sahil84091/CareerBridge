from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.entities import User, Profile
from backend.app.schemas.schemas import LoginRequest, RegisterRequest, AuthResponse, UserSummary

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    return AuthResponse(
        token=f"bearer_{user.id}",
        user=UserSummary(id=user.id, email=user.email, full_name=user.full_name),
    )


@router.post("/demo", response_model=AuthResponse)
def demo_login(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == "demo@careerbridge.ai").first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demo user not initialized",
        )
    return AuthResponse(
        token=f"bearer_{user.id}",
        user=UserSummary(id=user.id, email=user.email, full_name=user.full_name),
    )


@router.post("/register", response_model=AuthResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        password_hash="hashed_pw",
    )
    db.add(user)
    db.flush()

    profile = Profile(
        user_id=user.id,
        bio="Welcome to CareerBridge AI!",
        current_title="Aspiring Developer",
        target_role_title="Full Stack Developer",
    )
    db.add(profile)
    db.commit()
    db.refresh(user)

    return AuthResponse(
        token=f"bearer_{user.id}",
        user=UserSummary(id=user.id, email=user.email, full_name=user.full_name),
    )


@router.get("/me", response_model=UserSummary)
def get_current_user(user_id: str = "demo_user_01", db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = db.query(User).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserSummary(id=user.id, email=user.email, full_name=user.full_name)
