from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field, field_validator


# Auth Schemas
class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    full_name: str
    password: str


class UserSummary(BaseModel):
    id: str
    email: str
    full_name: str


class AuthResponse(BaseModel):
    token: str
    user: UserSummary


# Profile Schemas
class ProfileResponse(BaseModel):
    id: str
    user_id: str
    full_name: str
    email: str
    bio: Optional[str] = None
    current_title: Optional[str] = None
    target_role_id: Optional[str] = None
    target_role_title: Optional[str] = None
    experience_level: Optional[str] = None
    education_level: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_data: Optional[Dict[str, Any]] = None
    linkedin_data: Optional[Dict[str, Any]] = None


class ProfileUpdateRequest(BaseModel):
    bio: Optional[str] = None
    current_title: Optional[str] = None
    target_role_id: Optional[str] = None
    target_role_title: Optional[str] = None
    experience_level: Optional[str] = None
    education_level: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None


class LinkGitHubRequest(BaseModel):
    github_url: str


class LinkLinkedInRequest(BaseModel):
    linkedin_url: str
    headline: Optional[str] = None
    summary: Optional[str] = None
    skills_text: Optional[str] = None


class ResumeProjectSuggestion(BaseModel):
    title: str
    description: str
    target_skills: List[str]
    impact_bullet_points: List[str]
    source_origin: str  # e.g. "GitHub Repository", "Industry Gap", "LinkedIn Experience"
    recommended_action: str  # "Add to Resume", "Highlight in Portfolio", etc.


class ProfileEnhancementResponse(BaseModel):
    synced_github: bool = False
    synced_linkedin: bool = False
    detected_skills: List[str] = []
    project_suggestions: List[ResumeProjectSuggestion] = []
    resume_enhancements: List[str] = []
    personalized_roles: List[str] = []


class UserPreferenceResponse(BaseModel):
    salary_expectation: Optional[str] = None
    remote_only: bool = False


class UserPreferenceUpdate(BaseModel):
    salary_expectation: Optional[str] = Field(default=None, max_length=80)
    remote_only: bool


# Skill Schemas
class SkillItem(BaseModel):
    id: str
    name: str
    category: str
    description: Optional[str] = None
    importance: Optional[str] = "Medium"
    aliases: Optional[List[str]] = []


class UserSkillItem(BaseModel):
    id: str
    skill_name: str
    category: str
    proficiency: str
    verified: bool
    source: str


class AddUserSkillRequest(BaseModel):
    skill_name: str = Field(min_length=1, max_length=100)
    proficiency: Literal["Strong", "Moderate", "Familiar"] = "Moderate"


# Resume Schemas
class ParsedResumeSkill(BaseModel):
    name: str
    category: Optional[str] = None
    proficiency: Optional[str] = None
    importance: Optional[str] = None


class ResumeEducation(BaseModel):
    degree: Optional[str] = None
    institution: Optional[str] = None
    graduation_year: Optional[str] = None


class ResumeExperience(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    duration: Optional[str] = None
    description: Optional[str] = None
    skills_applied: List[str] = Field(default_factory=list)


class ResumeProject(BaseModel):
    title: str
    description: Optional[str] = None
    technologies: List[str] = Field(default_factory=list)


class ResumeCertification(BaseModel):
    name: str
    issuer: Optional[str] = "Independent Issuer"
    year: Optional[str] = None
    credibility_score: int = Field(default=50, ge=0, le=100)
    priority_level: Literal["High", "Medium", "Low", "Unverified"] = "Medium"
    is_legitimate: bool = True
    skills_validated: List[str] = Field(default_factory=list)
    reputation_notes: Optional[str] = None


class ResumeParseOutput(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    education: List[ResumeEducation] = Field(default_factory=list)
    experience: List[ResumeExperience] = Field(default_factory=list)
    skills: List[ParsedResumeSkill] = Field(default_factory=list)
    projects: List[ResumeProject] = Field(default_factory=list)
    certifications: List[ResumeCertification] = Field(default_factory=list)

    @field_validator("certifications", mode="before")
    @classmethod
    def normalize_certifications(cls, v: Any) -> List[Any]:
        if not v:
            return []
        from backend.app.ai.certification_evaluator import certification_evaluator
        result = []
        for item in v:
            if isinstance(item, (str, dict)):
                result.append(certification_evaluator.evaluate(item))
            else:
                result.append(item)
        return result


class ResumeAnalysisResponse(BaseModel):
    resume_id: str
    filename: str
    parsed_data: ResumeParseOutput
    extracted_skills_count: int
    matched_canonical_skills: List[str]


# Career Role Schemas
class RoleSkillItem(BaseModel):
    skill_name: str
    category: str
    importance: str
    weight: float


class CareerRoleResponse(BaseModel):
    id: str
    title: str
    category: str
    description: str
    average_salary: Optional[str] = None
    market_demand: str
    required_skills: List[RoleSkillItem] = Field(default_factory=list)


# Skill Gap & Learning Resource Schemas
class CuratedResource(BaseModel):
    title: str
    platform: str
    url: str
    duration: Optional[str] = None
    type: Literal["video", "course", "documentation", "project"] = "video"
    skill: str
    description: Optional[str] = None


class StructuredPlanStep(BaseModel):
    step_number: int
    phase_name: str
    title: str
    focus_skills: List[str]
    action_items: List[str]
    estimated_weeks: str
    recommended_video: Optional[CuratedResource] = None


class SkillGapItem(BaseModel):
    name: str
    category: str
    proficiency: str  # Strong, Moderate, Familiar, Missing
    importance: str  # Core, Important, Bonus
    weight: float


class SkillGapAnalysisRequest(BaseModel):
    role_id: Optional[str] = None


class SkillGapAnalysisResponse(BaseModel):
    role_id: str
    role_title: str
    readiness_score: float
    matched_skills: List[SkillGapItem]
    partial_skills: List[SkillGapItem]
    missing_skills: List[SkillGapItem]
    priority_skills: List[str]
    total_required: int
    matched_count: int
    partial_count: int
    missing_count: int
    certifications_summary: List[ResumeCertification] = Field(default_factory=list)
    curated_resources: List[CuratedResource] = Field(default_factory=list)
    structured_plan: List[StructuredPlanStep] = Field(default_factory=list)


# Roadmap Schemas
class RoadmapPhaseItem(BaseModel):
    id: Optional[str] = None
    phase_number: int
    phase_name: str
    title: str
    description: str
    skills: List[str]
    milestone_projects: List[str]
    learning_goals: List[str]
    completed_goals: List[str] = Field(default_factory=list)
    status: str = "pending"
    curated_videos: List[CuratedResource] = Field(default_factory=list)


class RoadmapResponse(BaseModel):
    id: str
    role_id: str
    role_title: str
    target_duration: str
    current_progress: float
    phases: List[RoadmapPhaseItem]


# Opportunity Schemas
class OpportunityMatchItem(BaseModel):
    id: str
    title: str
    company: str
    location: str
    type: str
    salary_range: Optional[str]
    experience_level: str
    description: str
    apply_url: Optional[str]
    required_skills: List[str]
    preferred_skills: List[str]
    match_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    source: str = "Adzuna"


# Dashboard Schemas
class DashboardStatsResponse(BaseModel):
    user: UserSummary
    profile: ProfileResponse
    target_role: Optional[CareerRoleResponse] = None
    readiness_score: float
    skill_counts: Dict[str, int]
    top_skill_gaps: List[str]
    roadmap_progress: float
    recommended_opportunities: List[OpportunityMatchItem]
    recent_skills: List[UserSkillItem]
