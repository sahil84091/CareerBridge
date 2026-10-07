import os
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()


class Settings:
    def __init__(self) -> None:
        self.environment = os.getenv("ENV", "development").lower()
        self.database_url = os.getenv("DATABASE_URL", "sqlite:///./careerbridge.db")
        self.frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")
        self.allowed_origins = [
            origin.strip().rstrip("/")
            for origin in os.getenv("CORS_ORIGINS", self.frontend_url).split(",")
            if origin.strip()
        ]
        self.session_secret = os.getenv("SESSION_SECRET", "")
        self.session_cookie_secure = os.getenv(
            "SESSION_COOKIE_SECURE", "true" if self.environment == "production" else "false"
        ).lower() in {"1", "true", "yes"}
        self.session_cookie_samesite = os.getenv("SESSION_COOKIE_SAMESITE", "lax").lower()
        self.google_client_id = os.getenv("GOOGLE_CLIENT_ID", "")
        self.google_client_secret = os.getenv("GOOGLE_CLIENT_SECRET", "")
        self.google_redirect_uri = os.getenv(
            "GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/google/callback"
        )
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "")
        self.gemini_model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        self.adzuna_app_id = os.getenv("ADZUNA_APP_ID", "")
        self.adzuna_app_key = os.getenv("ADZUNA_APP_KEY", "")
        self.adzuna_country = os.getenv("ADZUNA_COUNTRY", "in").lower()
        self.adzuna_results_per_page = int(os.getenv("ADZUNA_RESULTS_PER_PAGE", "20"))
        self.resume_max_bytes = int(os.getenv("RESUME_MAX_BYTES", str(10 * 1024 * 1024)))
        self.s3_bucket = os.getenv("S3_BUCKET", "")
        self.s3_region = os.getenv("AWS_REGION", os.getenv("S3_REGION", "ap-south-1"))
        self.s3_endpoint_url = os.getenv("S3_ENDPOINT_URL", "") or None

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
