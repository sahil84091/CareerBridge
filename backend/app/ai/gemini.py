import logging
from typing import Any

from pydantic import BaseModel, Field

from backend.app.config import get_settings
from backend.app.schemas.schemas import ResumeParseOutput

logger = logging.getLogger(__name__)


class GeneratedPhase(BaseModel):
    phase_number: int
    phase_name: str
    title: str
    description: str
    skills: list[str] = Field(default_factory=list)
    milestone_projects: list[str] = Field(default_factory=list)
    learning_goals: list[str] = Field(default_factory=list)
    status: str = "pending"


class GeneratedRoadmap(BaseModel):
    phases: list[GeneratedPhase]


class GeminiService:
    def __init__(self):
        self.settings = get_settings()

    @property
    def configured(self) -> bool:
        return bool(self.settings.gemini_api_key)

    def _client(self):
        from google import genai
        return genai.Client(api_key=self.settings.gemini_api_key)

    def parse_resume(self, text: str) -> dict[str, Any] | None:
        if not self.configured:
            return None
        try:
            from google.genai import types
            response = self._client().models.generate_content(
                model=self.settings.gemini_model,
                contents=(
                    "Extract only facts explicitly present in this resume. "
                    "Extract candidate name, email, education, experience, projects, skills, and certifications. "
                    "For certifications, accurately extract the certification name, issuer organization, year (if specified), "
                    "and skills validated by that certification. "
                    "Do not invent facts not present in the text.\n\n" + text[:100_000]
                ),
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=ResumeParseOutput,
                    temperature=0.1,
                    automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True),
                ),
            )
            return ResumeParseOutput.model_validate_json(response.text).model_dump()
        except Exception:
            logger.exception("Gemini resume extraction failed; using local parser")
            return None

    def generate_roadmap(self, role_title: str, missing: list[str], partial: list[str], matched: list[str]) -> list[dict[str, Any]] | None:
        if not self.configured:
            return None
        try:
            from google.genai import types
            response = self._client().models.generate_content(
                model=self.settings.gemini_model,
                contents=(
                    f"Create a practical five-phase learning roadmap for {role_title}. "
                    f"Prioritize missing skills: {missing}. Improve partially known skills: {partial}. "
                    f"Assume the candidate has these skills: {matched}. Use numbered phases 1 through 5. "
                    "Return actionable goals and small portfolio milestones."
                ),
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=GeneratedRoadmap,
                    temperature=0.35,
                    automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True),
                ),
            )
            result = GeneratedRoadmap.model_validate_json(response.text)
            if len(result.phases) != 5 or sorted(p.phase_number for p in result.phases) != [1, 2, 3, 4, 5]:
                raise ValueError("Gemini returned an invalid roadmap phase sequence")
            return [phase.model_dump() for phase in sorted(result.phases, key=lambda item: item.phase_number)]
        except Exception:
            logger.exception("Gemini roadmap generation failed; using deterministic fallback")
            return None

    def generate_profile_enhancements(
        self,
        candidate_name: str,
        target_role: str,
        recorded_skills: list[str],
        github_data: dict[str, Any] | None = None,
        linkedin_data: dict[str, Any] | None = None,
    ) -> dict[str, Any] | None:
        """
        Uses Gemini to generate tailored project ideas to build, high-impact resume bullet points,
        and targeted role recommendations based on connected GitHub & LinkedIn activity.
        """
        if not self.configured:
            return None
        try:
            from google.genai import types

            prompt = (
                f"You are a principal tech career strategist. Analyze candidate '{candidate_name}' pursuing '{target_role}'.\n"
                f"Current recorded skills: {recorded_skills}\n"
                f"GitHub connected data: {github_data}\n"
                f"LinkedIn connected data: {linkedin_data}\n\n"
                "Provide:\n"
                "1. 3 highly specific portfolio project suggestions that bridge skill gaps for the target role.\n"
                "2. 4 quantifiable, recruiter-optimized resume accomplishment bullet points incorporating their GitHub/LinkedIn stack.\n"
                "3. 3 specialized high-fit job titles to explore based on their unique combined tech footprint.\n"
                "Return strictly valid JSON with keys: 'project_suggestions' (list of {title, description, target_skills, impact_bullet_points, source_origin, recommended_action}), "
                "'resume_enhancements' (list of strings), 'personalized_roles' (list of strings)."
            )

            response = self._client().models.generate_content(
                model=self.settings.gemini_model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.3,
                    automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True),
                ),
            )
            import json
            return json.loads(response.text)
        except Exception:
            logger.exception("Gemini profile enhancement generation failed; using fallback")
            return None


gemini_service = GeminiService()

