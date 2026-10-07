from datetime import datetime

from authlib.integrations.starlette_client import OAuth
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy.orm import Session

from backend.app.config import get_settings
from backend.app.database.session import get_db
from backend.app.models.entities import Profile, User, UserSession
from backend.app.schemas.schemas import UserSummary
from backend.app.security import (
    SESSION_COOKIE,
    _token_hash,
    clear_session_cookies,
    create_session,
    get_current_user,
    set_session_cookies,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
oauth = OAuth()
settings = get_settings()
oauth.register(
    name="google",
    client_id=settings.google_client_id,
    client_secret=settings.google_client_secret,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)


@router.get("/google")
async def google_login(request: Request):
    if not settings.google_client_id or not settings.google_client_secret:
        raise HTTPException(status_code=503, detail="Google sign-in is not configured")
    return await oauth.google.authorize_redirect(request, settings.google_redirect_uri)


@router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    try:
        token = await oauth.google.authorize_access_token(request)
        userinfo = token.get("userinfo") or await oauth.google.userinfo(token=token)
    except Exception as exc:
        request.session.clear()
        raise HTTPException(status_code=401, detail="Google sign-in could not be verified") from exc

    subject = userinfo.get("sub")
    email = userinfo.get("email", "").strip().lower()
    if not subject or not email or not userinfo.get("email_verified"):
        raise HTTPException(status_code=401, detail="Google must provide a verified email address")

    user = db.query(User).filter(User.google_subject == subject).first()
    if not user:
        # Claim an existing account only when Google confirms the same email.
        user = db.query(User).filter(User.email == email).first()
        if user and user.google_subject not in (None, subject):
            raise HTTPException(status_code=409, detail="Email is linked to another identity")
        if not user:
            user = User(email=email, full_name=userinfo.get("name") or email.split("@")[0], google_subject=subject)
            db.add(user)
            db.flush()
            db.add(Profile(user_id=user.id))
        else:
            user.google_subject = subject
            user.full_name = userinfo.get("name") or user.full_name
        db.commit()

    session_token, csrf_token = create_session(db, user)
    redirect = RedirectResponse(f"{settings.frontend_url}/auth/complete", status_code=302)
    set_session_cookies(redirect, session_token, csrf_token)
    request.session.clear()
    return redirect


@router.get("/me", response_model=UserSummary)
def get_me(user: User = Depends(get_current_user)):
    return UserSummary(id=user.id, email=user.email, full_name=user.full_name)


@router.post("/logout")
def logout(request: Request, db: Session = Depends(get_db)):
    raw_token = request.cookies.get(SESSION_COOKIE)
    if raw_token:
        session = db.query(UserSession).filter(UserSession.token_hash == _token_hash(raw_token)).first()
        if session and session.revoked_at is None:
            session.revoked_at = datetime.utcnow()
            db.commit()
    result = JSONResponse({"status": "signed_out"})
    clear_session_cookies(result)
    return result
