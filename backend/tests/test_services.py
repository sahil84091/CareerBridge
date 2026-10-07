from types import SimpleNamespace

from backend.app.models.entities import Opportunity
from backend.app.services import adzuna


def test_adzuna_results_are_normalized_cached_and_ranked(test_db, account, monkeypatch):
    settings = SimpleNamespace(
        adzuna_app_id="test-id",
        adzuna_app_key="test-key",
        adzuna_country="in",
        adzuna_results_per_page=5,
    )
    monkeypatch.setattr(adzuna, "get_settings", lambda: settings)

    class Response:
        def raise_for_status(self):
            pass

        def json(self):
            return {"results": [{
                "id": "ad-1",
                "title": "Python Engineer",
                "company": {"display_name": "Example Co"},
                "location": {"display_name": "Kolkata"},
                "description": "We require Python and SQL.",
                "redirect_url": "https://jobs.example.test/1",
                "contract_type": "permanent",
                "contract_time": "full_time",
                "salary_min": 500000,
                "salary_max": 700000,
                "created": "2026-10-01T12:00:00Z",
            }]}

    monkeypatch.setattr(adzuna.httpx, "get", lambda *args, **kwargs: Response())
    result = adzuna.matched_opportunities(test_db, account["user"], role_filter="Python")
    assert result[0]["company"] == "Example Co"
    assert result[0]["type"] == "Full-time"
    assert result[0]["apply_url"] == "https://jobs.example.test/1"
    assert "Python" in result[0]["required_skills"]
    cached = test_db.query(Opportunity).filter_by(source="adzuna:in", external_id="ad-1").one()
    assert cached.fetched_at is not None
    filtered = adzuna.matched_opportunities(test_db, account["user"], type_filter="full-time")
    assert len(filtered) == 1
    assert filtered[0]["title"] == "Python Engineer"


def test_local_resume_parser_does_not_invent_sections(monkeypatch):
    from backend.app.ai.resume_parser import resume_parser
    result = resume_parser.parse_resume_content("Candidate\nA short personal note.")
    assert result["experience"] == []
    assert result["education"] == []
    assert result["projects"] == []
    assert result["certifications"] == []


def test_gemini_adapter_validates_structured_resume_and_roadmap_responses(monkeypatch):
    from backend.app.ai.gemini import GeminiService
    from types import SimpleNamespace

    service = GeminiService()
    service.settings = SimpleNamespace(gemini_api_key="test-key", gemini_model="test-model")
    calls = []

    class Models:
        def generate_content(self, **kwargs):
            calls.append(kwargs)
            if "Extract only facts" in kwargs["contents"]:
                return SimpleNamespace(text='{"name":"Candidate","skills":[{"name":"Python"}]}')
            return SimpleNamespace(text='{"phases":[' + ",".join(
                '{"phase_number":%d,"phase_name":"Phase %d","title":"Step %d","description":"Learn and build","skills":["Python"],"milestone_projects":["Project %d"],"learning_goals":["Goal %d"]}' % (number, number, number, number, number)
                for number in range(1, 6)
            ) + ']}')

    monkeypatch.setattr(service, "_client", lambda: SimpleNamespace(models=Models()))

    parsed = service.parse_resume("Candidate resume")
    assert parsed["name"] == "Candidate"
    assert parsed["skills"][0]["name"] == "Python"
    phases = service.generate_roadmap("Python Engineer", ["Python"], [], [])
    assert len(phases) == 5
    assert [phase["phase_number"] for phase in phases] == [1, 2, 3, 4, 5]
    assert len(calls) == 2
    assert all(call["config"].response_mime_type == "application/json" for call in calls)


def test_gemini_adapter_rejects_invalid_roadmap_and_falls_back(monkeypatch):
    from backend.app.ai.gemini import GeminiService
    from types import SimpleNamespace

    service = GeminiService()
    service.settings = SimpleNamespace(gemini_api_key="test-key", gemini_model="test-model")
    monkeypatch.setattr(
        service,
        "_client",
        lambda: SimpleNamespace(models=SimpleNamespace(
            generate_content=lambda **kwargs: SimpleNamespace(text='{"phases":[]}')
        )),
    )
    assert service.generate_roadmap("Python Engineer", [], [], []) is None


def test_resume_storage_uses_private_user_scoped_local_and_s3_paths(monkeypatch):
    from pathlib import Path
    from tempfile import TemporaryDirectory
    from types import SimpleNamespace
    from backend.app.storage import ResumeStorage

    with TemporaryDirectory(dir=".tmp") as temp_dir:
        root = Path(temp_dir).resolve()
        storage = ResumeStorage()
        storage.settings = SimpleNamespace(s3_bucket="", is_production=False)
        monkeypatch.setenv("LOCAL_RESUME_DIR", str(root))
        local_path = storage.put("user-a", "../candidate resume.pdf", b"private resume")
        assert Path(local_path).is_relative_to(root)
        assert "/resumes/user-a/" in local_path.replace("\\", "/")
        assert Path(local_path).read_bytes() == b"private resume"

        class S3Client:
            def __init__(self):
                self.upload = None

            def put_object(self, **kwargs):
                self.upload = kwargs

        client = S3Client()
        monkeypatch.setattr("boto3.client", lambda *args, **kwargs: client)
        storage.settings = SimpleNamespace(
            s3_bucket="private-resumes", s3_region="ap-south-1", s3_endpoint_url=None, is_production=True
        )
        s3_path = storage.put("user-a", "candidate.pdf", b"private resume")
        assert s3_path.startswith("s3://private-resumes/resumes/user-a/")
        assert client.upload["Bucket"] == "private-resumes"
        assert client.upload["Body"] == b"private resume"


def test_resume_storage_refuses_local_writes_in_production():
    import pytest
    from types import SimpleNamespace
    from backend.app.storage import ResumeStorage

    storage = ResumeStorage()
    storage.settings = SimpleNamespace(s3_bucket="", is_production=True)
    with pytest.raises(RuntimeError, match="S3_BUCKET"):
        storage.put("user-a", "candidate.pdf", b"private resume")
