import hashlib
import secrets
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from backend.app.config import get_settings
from backend.app.database.session import get_db
from backend.app.models.entities import User, UserSession

SESSION_COOKIE = "cb_session"
CSRF_COOKIE = "cb_csrf"
SESSION_TTL = timedelta(days=14)


def _token_hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_session(db: Session, user: User) -> tuple[str, str]:
    session_token = secrets.token_urlsafe(48)
    csrf_token = secrets.token_urlsafe(32)
    db.add(
        UserSession(
            user_id=user.id,
            token_hash=_token_hash(session_token),
            expires_at=datetime.utcnow() + SESSION_TTL,
        )
    )
    db.commit()
    return session_token, csrf_token


def set_session_cookies(response, session_token: str, csrf_token: str) -> None:
    settings = get_settings()
    common = {
        "secure": settings.session_cookie_secure,
        "samesite": settings.session_cookie_samesite,
        "max_age": int(SESSION_TTL.total_seconds()),
        "path": "/",
    }
    response.set_cookie(SESSION_COOKIE, session_token, httponly=True, **common)
    response.set_cookie(CSRF_COOKIE, csrf_token, httponly=False, **common)


def clear_session_cookies(response) -> None:
    settings = get_settings()
    common = {"path": "/", "secure": settings.session_cookie_secure, "samesite": settings.session_cookie_samesite}
    response.delete_cookie(SESSION_COOKIE, httponly=True, **common)
    response.delete_cookie(CSRF_COOKIE, **common)


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sign in required")
    session = (
        db.query(UserSession)
        .filter(
            UserSession.token_hash == _token_hash(token),
            UserSession.revoked_at.is_(None),
            UserSession.expires_at > datetime.utcnow(),
        )
        .first()
    )
    if not session or not session.user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired or invalid")
    return session.user


def csrf_protection(request: Request) -> None:
    if request.method not in {"POST", "PUT", "PATCH", "DELETE"}:
        return
    if request.url.path in {"/api/auth/google/callback"}:
        return
    from backend.app.config import get_settings
    origin = request.headers.get("origin")
    if origin and origin.rstrip("/") not in get_settings().allowed_origins:
        raise HTTPException(status_code=403, detail="Request origin is not allowed")
    cookie_token = request.cookies.get(CSRF_COOKIE)
    header_token = request.headers.get("x-csrf-token")
    if not cookie_token or not header_token or not secrets.compare_digest(cookie_token, header_token):
        raise HTTPException(status_code=403, detail="CSRF validation failed")
