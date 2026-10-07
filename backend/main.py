import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB & Seed data
    print("Initializing CareerBridge AI Database & Taxonomy Seed...")
    try:
        seed_database()
        print("Database ready.")
    except Exception as e:
        print(f"Database seed initialization warning: {e}")
    yield


app = FastAPI(
    title="CareerBridge AI API",
    description="Intelligent Career Intelligence, Skill Gap Analysis & Talent Discovery Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CareerBridge AI Core Engine",
        "version": "1.0.0",
    }


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
