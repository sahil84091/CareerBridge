from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.models.entities import CareerRole, Profile, User
from backend.app.schemas.schemas import (
    LinkGitHubRequest,
    LinkLinkedInRequest,
    ProfileEnhancementResponse,
    ProfileResponse,
    ProfileUpdateRequest,
    ResumeProjectSuggestion,
)
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
        github_data=profile.github_data,
        linkedin_data=profile.linkedin_data,
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


def _sync_skills_into_user(db: Session, user: User, skills_list: list, source: str):
    """Auto-incorporates detected skills into the user's verified skills portfolio."""
    from backend.app.ai.taxonomy import taxonomy
    from backend.app.models.entities import Skill, UserSkill

    for s_name in skills_list:
        if not s_name:
            continue
        canonical = taxonomy.normalize(s_name) or s_name
        skill_obj = db.query(Skill).filter(Skill.name.ilike(canonical)).first()
        if not skill_obj:
            details = taxonomy.get_skill_details(canonical)
            cat = details.get("category", "Technical") if details else "Technical"
            skill_obj = Skill(name=canonical, category=cat, importance="Medium")
            db.add(skill_obj)
            db.flush()

        existing = (
            db.query(UserSkill)
            .filter(UserSkill.user_id == user.id, UserSkill.skill_id == skill_obj.id)
            .first()
        )
        if not existing:
            new_us = UserSkill(
                user_id=user.id,
                skill_id=skill_obj.id,
                proficiency="Moderate",
                verified=True,
                source=source,
            )
            db.add(new_us)
        else:
            # Upgrade verified flag if verified by code/social sync
            existing.verified = True


@router.post("/link/github", response_model=ProfileResponse)
def link_github(
    payload: LinkGitHubRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    from backend.app.services.social_profile import social_profile_service

    profile = _profile_for(db, user)
    try:
        data = social_profile_service.sync_github(payload.github_url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to sync GitHub: {str(e)}")

    profile.github_url = data.get("profile_url", payload.github_url)
    profile.github_data = data

    # Auto sync detected languages/skills into user's skills
    detected_skills = data.get("detected_skills", [])
    _sync_skills_into_user(db, user, detected_skills, source="GitHub")

    db.commit()
    db.refresh(profile)
    return _response(profile, user)


@router.delete("/link/github", response_model=ProfileResponse)
def unlink_github(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    profile = _profile_for(db, user)
    profile.github_url = None
    profile.github_data = None
    db.commit()
    db.refresh(profile)
    return _response(profile, user)


@router.post("/link/linkedin", response_model=ProfileResponse)
def link_linkedin(
    payload: LinkLinkedInRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    from backend.app.services.social_profile import social_profile_service

    profile = _profile_for(db, user)
    try:
        data = social_profile_service.sync_linkedin(
            payload.linkedin_url,
            headline=payload.headline,
            summary=payload.summary,
            skills_text=payload.skills_text,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to sync LinkedIn: {str(e)}")

    profile.linkedin_url = data.get("profile_url", payload.linkedin_url)
    profile.linkedin_data = data

    # Auto sync detected skills into user's skills
    detected_skills = data.get("detected_skills", [])
    _sync_skills_into_user(db, user, detected_skills, source="LinkedIn")

    db.commit()
    db.refresh(profile)
    return _response(profile, user)


@router.delete("/link/linkedin", response_model=ProfileResponse)
def unlink_linkedin(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    profile = _profile_for(db, user)
    profile.linkedin_url = None
    profile.linkedin_data = None
    db.commit()
    db.refresh(profile)
    return _response(profile, user)


@router.get("/enhancements", response_model=ProfileEnhancementResponse)
def get_profile_enhancements(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    from backend.app.ai.gemini import gemini_service
    from backend.app.models.entities import UserSkill

    profile = _profile_for(db, user)
    gh_data = profile.github_data or {}
    li_data = profile.linkedin_data or {}

    user_skills = [
        us.skill.name
        for us in db.query(UserSkill).filter(UserSkill.user_id == user.id).all()
        if us.skill
    ]

    target_role = profile.target_role_title or (
        profile.target_role.title if profile.target_role else "Software Engineer"
    )

    combined_detected = list(
        dict.fromkeys(gh_data.get("detected_skills", []) + li_data.get("detected_skills", []))
    )

    # Call AI enhancement service
    ai_enhancements = gemini_service.generate_profile_enhancements(
        candidate_name=user.full_name or "Candidate",
        target_role=target_role,
        recorded_skills=user_skills,
        github_data=gh_data,
        linkedin_data=li_data,
    )

    if ai_enhancements:
        project_suggestions = [
            ResumeProjectSuggestion(**p) for p in ai_enhancements.get("project_suggestions", [])
        ]
        resume_enhancements = ai_enhancements.get("resume_enhancements", [])
        personalized_roles = ai_enhancements.get("personalized_roles", [])
    else:
        # Deterministic rich fallback based on repos and profile
        repos = gh_data.get("top_repositories", [])
        project_suggestions = []

        if repos:
            for repo in repos[:3]:
                lang = repo.get("language") or "Full-Stack"
                repo_name = repo.get("name", "Project")
                project_suggestions.append(
                    ResumeProjectSuggestion(
                        title=f"Production {repo_name.replace('-', ' ').title()} Showcase",
                        description=f"Elevate your {repo_name} repository into an enterprise-grade showcase with automated testing, CI/CD, and benchmark docs.",
                        target_skills=[lang, "CI/CD", "Docker", "Unit Testing"],
                        impact_bullet_points=[
                            f"Architected modular {lang} service with automated CI/CD pipeline reducing build cycles by 35%.",
                            f"Engineered high-throughput API endpoints with comprehensive test coverage and documentation.",
                        ],
                        source_origin="GitHub Repository",
                        recommended_action="Add to Resume & Feature on GitHub",
                    )
                )

        if len(project_suggestions) < 3:
            project_suggestions.append(
                ResumeProjectSuggestion(
                    title=f"Distributed {target_role} System & Analytics Dashboard",
                    description=f"Build an end-to-end full-stack analytics platform targeting {target_role} core competencies.",
                    target_skills=["FastAPI", "React", "PostgreSQL", "Docker"],
                    impact_bullet_points=[
                        "Engineered scalable microservices processing real-time telemetry with sub-50ms latency.",
                        "Designed responsive React frontend and RESTful backend with secure JWT authentication.",
                    ],
                    source_origin="Target Role Gap Analysis",
                    recommended_action="Build New Showcase Project",
                )
            )

        resume_enhancements = [
            f"Designed and published {gh_data.get('public_repos', 3)}+ modular repositories on GitHub using {', '.join(gh_data.get('languages', ['Python', 'TypeScript'])[:3])}.",
            f"Optimized application architectures adhering to clean code standards and automated testing suites.",
            f"Demonstrated collaborative proficiency in Git version control, technical problem-solving, and continuous integration.",
            f"Engineered production-ready full stack features aligned with {target_role} best practices.",
        ]

        personalized_roles = [
            target_role,
            f"Full-Stack {target_role}",
            f"{gh_data.get('languages', ['Software'])[0]} Platform Engineer" if gh_data.get("languages") else f"Associate {target_role}",
        ]

    return ProfileEnhancementResponse(
        synced_github=bool(profile.github_data),
        synced_linkedin=bool(profile.linkedin_data),
        detected_skills=combined_detected,
        project_suggestions=project_suggestions,
        resume_enhancements=resume_enhancements,
        personalized_roles=personalized_roles,
    )

