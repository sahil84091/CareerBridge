import os
import re
from pathlib import Path
from uuid import uuid4

from backend.app.config import get_settings


class ResumeStorage:
    def __init__(self):
        self.settings = get_settings()

    def put(self, user_id: str, filename: str, content: bytes) -> str:
        safe_name = re.sub(r"[^A-Za-z0-9._-]", "_", Path(filename).name)[:120] or "resume"
        key = f"resumes/{user_id}/{uuid4().hex}-{safe_name}"
        if self.settings.s3_bucket:
            import boto3
            client = boto3.client(
                "s3",
                region_name=self.settings.s3_region,
                endpoint_url=self.settings.s3_endpoint_url,
            )
            client.put_object(Bucket=self.settings.s3_bucket, Key=key, Body=content)
            return f"s3://{self.settings.s3_bucket}/{key}"
        if self.settings.is_production:
            raise RuntimeError("S3_BUCKET must be configured in production")
        root = Path(os.getenv("LOCAL_RESUME_DIR", ".tmp/resumes")).resolve()
        path = (root / key).resolve()
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)
        return str(path)


resume_storage = ResumeStorage()
