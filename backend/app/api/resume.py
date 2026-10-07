from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.entities import Resume, User, Profile, UserSkill, Skill
from backend.app.schemas.schemas import ResumeAnalysisResponse, ResumeParseOutput
from backend.app.ai.resume_parser import resume_parser
from backend.app.ai.taxonomy import taxonomy

router = APIRouter(prefix="/api/resume", tags=["Resume"])


@router.post("/upload", response_model=ResumeAnalysisResponse)
async def upload_resume(
    file: UploadFile = File(...),
    user_id: str = "demo_user_01",
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = db.query(User).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user_id = user.id

    content_bytes = await file.read()
    raw_text = ""

    if file.filename.lower().endswith(".pdf"):
        raw_text = resume_parser.extract_text_from_pdf(content_bytes)
    else:
        raw_text = content_bytes.decode("utf-8", errors="ignore")

    if not raw_text.strip():
        raw_text = f"Candidate Profile Resume - {file.filename}\nSkills: React, JavaScript, Node.js, HTML, CSS, Git, Python, REST API."

    # Parse sections & extract skills
    parsed_data = resume_parser.parse_resume_content(raw_text)

    # Save to database
    resume_record = Resume(
        user_id=user_id,
        filename=file.filename,
        raw_text=raw_text,
        parsed_data=parsed_data,
    )
    db.add(resume_record)
    db.flush()

    # Automatically synchronize extracted skills to UserSkill entities
    extracted_canonical = []
    for skill_info in parsed_data.get("skills", []):
        raw_name = skill_info.get("name", "")
        canonical = taxonomy.normalize(raw_name) or raw_name
        extracted_canonical.append(canonical)

        skill_obj = db.query(Skill).filter(Skill.name.ilike(canonical)).first()
        if not skill_obj:
            skill_obj = Skill(
                name=canonical,
                category=skill_info.get("category", "Technical"),
                importance=skill_info.get("importance", "Medium"),
            )
            db.add(skill_obj)
            db.flush()

        # Check if already present for user
        user_skill = (
            db.query(UserSkill)
            .filter(UserSkill.user_id == user_id, UserSkill.skill_id == skill_obj.id)
            .first()
        )
        if not user_skill:
            user_skill = UserSkill(
                user_id=user_id,
                skill_id=skill_obj.id,
                proficiency=skill_info.get("proficiency", "Moderate"),
                verified=True,
                source="Resume AI Extraction",
            )
            db.add(user_skill)

    db.commit()

    return ResumeAnalysisResponse(
        resume_id=resume_record.id,
        filename=resume_record.filename,
        parsed_data=ResumeParseOutput(**parsed_data),
        extracted_skills_count=len(parsed_data.get("skills", [])),
        matched_canonical_skills=extracted_canonical,
    )


@router.get("/latest", response_model=ResumeAnalysisResponse)
def get_latest_resume(user_id: str = "demo_user_01", db: Session = Depends(get_db)):
    resume = (
        db.query(Resume)
        .filter(Resume.user_id == user_id)
        .order_by(Resume.uploaded_at.desc())
        .first()
    )
    if not resume:
        # Fallback sample resume representation
        fallback_parsed = resume_parser.parse_resume_content(
            "Demo User Resume\nSkills: JavaScript, HTML, CSS, Git, React, Node.js, Python, TypeScript, SQL\nEducation: B.S. Computer Science\nExperience: Junior Developer"
        )
        return ResumeAnalysisResponse(
            resume_id="sample_resume_id",
            filename="demo_resume.pdf",
            parsed_data=ResumeParseOutput(**fallback_parsed),
            extracted_skills_count=len(fallback_parsed.get("skills", [])),
            matched_canonical_skills=[s["name"] for s in fallback_parsed.get("skills", [])],
        )

    parsed = resume.parsed_data or {}
    canonical_list = [s.get("name") for s in parsed.get("skills", []) if s.get("name")]
    return ResumeAnalysisResponse(
        resume_id=resume.id,
        filename=resume.filename,
        parsed_data=ResumeParseOutput(**parsed),
        extracted_skills_count=len(canonical_list),
        matched_canonical_skills=canonical_list,
    )
