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
                    "Extract only facts explicitly present in this resume. Use empty arrays or null for absent data. "
                    "Do not invent employers, dates, schools, projects, certifications, or skills.\n\n" + text[:100_000]
                ),
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=ResumeParseOutput,
                    temperature=0.1,
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
                ),
            )
            result = GeneratedRoadmap.model_validate_json(response.text)
            if len(result.phases) != 5 or sorted(p.phase_number for p in result.phases) != [1, 2, 3, 4, 5]:
                raise ValueError("Gemini returned an invalid roadmap phase sequence")
            return [phase.model_dump() for phase in sorted(result.phases, key=lambda item: item.phase_number)]
        except Exception:
            logger.exception("Gemini roadmap generation failed; using deterministic generator")
            return None


gemini_service = GeminiService()
