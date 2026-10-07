import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from fastapi.responses import JSONResponse
from backend.app.config import get_settings
from backend.app.database.seed import seed_database
from backend.app.api.auth import router as auth_router
from backend.app.api.profile import router as profile_router
from backend.app.api.resume import router as resume_router
from backend.app.api.skills import router as skills_router
from backend.app.api.careers import router as careers_router
from backend.app.api.skill_gap import router as skill_gap_router
from backend.app.api.roadmap import router as roadmap_router
from backend.app.api.opportunities import router as opportunities_router
from backend.app.api.dashboard import router as dashboard_router
from backend.app.api.preferences import router as preferences_router
from backend.app.security import csrf_protection
from backend.migrate import upgrade_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    upgrade_database()
    seed_database()
    yield


app = FastAPI(
    title="CareerBridge AI API",
    description="Intelligent Career Intelligence, Skill Gap Analysis & Talent Discovery Platform",
    version="1.0.0",
    lifespan=lifespan,
)

settings = get_settings()


def validate_runtime_settings(settings):
    if not settings.is_production:
        return
    missing = []
    if len(settings.session_secret) < 32 or settings.session_secret in {
        "replace-with-a-long-random-secret",
        "local-development-session-secret-change-before-deploy",
    }:
        missing.append("SESSION_SECRET (at least 32 characters)")
    if not settings.database_url.startswith(("postgresql://", "postgresql+")):
        missing.append("DATABASE_URL (PostgreSQL required in production)")
    elif "local-development-only" in settings.database_url:
        missing.append("POSTGRES_PASSWORD (replace the local development password)")
    if not settings.s3_bucket:
        missing.append("S3_BUCKET")
    if not settings.google_client_id or not settings.google_client_secret:
        missing.append("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET")
    if not settings.gemini_api_key:
        missing.append("GEMINI_API_KEY")
    if not settings.adzuna_app_id or not settings.adzuna_app_key:
        missing.append("ADZUNA_APP_ID and ADZUNA_APP_KEY")
    if not settings.session_cookie_secure:
        missing.append("SESSION_COOKIE_SECURE=true")
    if not settings.frontend_url.startswith("https://"):
        missing.append("FRONTEND_URL (HTTPS required in production)")
    if not settings.google_redirect_uri.startswith("https://"):
        missing.append("GOOGLE_REDIRECT_URI (HTTPS required in production)")
    s3_endpoint_url = getattr(settings, "s3_endpoint_url", None)
    if s3_endpoint_url and not s3_endpoint_url.startswith("https://"):
        missing.append("S3_ENDPOINT_URL (HTTPS required in production)")
    if missing:
        raise RuntimeError("Production configuration is incomplete: " + "; ".join(missing))


validate_runtime_settings(settings)
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.session_secret or "careerbridge-local-development-only-secret",
    same_site=settings.session_cookie_samesite,
    https_only=settings.session_cookie_secure,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def enforce_csrf(request: Request, call_next):
    try:
        csrf_protection(request)
    except HTTPException as exc:
        return JSONResponse({"detail": exc.detail}, status_code=exc.status_code)
    return await call_next(request)

# Include Routers
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(resume_router)
app.include_router(skills_router)
app.include_router(careers_router)
app.include_router(skill_gap_router)
app.include_router(roadmap_router)
app.include_router(opportunities_router)
app.include_router(dashboard_router)
app.include_router(preferences_router)


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CareerBridge AI Core Engine",
        "version": "1.0.0",
    }


@app.get("/api/ready")
def readiness_check():
    from sqlalchemy import text
    from backend.app.database.session import engine

    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return {"status": "ready", "database": "reachable"}


@app.get("/")
def root():
    return {
        "platform": "CareerBridge AI",
        "message": "AI-Powered Career Intelligence & Skill Gap Discovery Platform",
        "docs_url": "/docs",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
