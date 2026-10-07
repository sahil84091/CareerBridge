import hashlib
import secrets
import asyncio
import time

import httpx
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.database.session import Base, get_db
from backend.app.models.entities import CareerRole, Profile, RoleSkill, Skill, User, UserSession, UserSkill
from backend.main import app


class InProcessEventLoop(asyncio.SelectorEventLoop):
    """Skip the Windows self-pipe, which is blocked in restricted test sandboxes."""

    def _make_self_pipe(self):
        self._ssock = None
        self._csock = None
        select = self._selector.select

        def select_without_sockets(timeout=None):
            if not self._selector.get_map():
                if timeout and timeout > 0:
                    time.sleep(timeout)
                return []
            return select(timeout)

        self._selector.select = select_without_sockets

    def _write_to_self(self):
        # ASGITransport runs requests on this same thread; no cross-thread wakeup is needed.
        pass

    def _close_self_pipe(self):
        pass


class InProcessEventLoopPolicy(asyncio.WindowsSelectorEventLoopPolicy):
    def new_event_loop(self):
        return InProcessEventLoop()


class InProcessAPIClient:
    """Synchronous test helper backed by ASGITransport (no local TCP socket)."""

    def __init__(self, app):
        self.app = app
        self.transport = httpx.ASGITransport(app=app)
        self.cookies = httpx.Cookies()
        self.headers = httpx.Headers()

    def request(self, method, url, **kwargs):
        async def send():
            async with httpx.AsyncClient(
                transport=self.transport,
                base_url="http://testserver",
                cookies=self.cookies,
                headers=self.headers,
                follow_redirects=False,
            ) as client:
                response = await client.request(method, url, **kwargs)
                self.cookies = client.cookies
                return response

        if hasattr(asyncio, "WindowsSelectorEventLoopPolicy"):
            asyncio.set_event_loop_policy(InProcessEventLoopPolicy())
        return asyncio.run(send())

    def get(self, url, **kwargs):
        return self.request("GET", url, **kwargs)

    def post(self, url, **kwargs):
        return self.request("POST", url, **kwargs)

    def put(self, url, **kwargs):
        return self.request("PUT", url, **kwargs)

    def patch(self, url, **kwargs):
        return self.request("PATCH", url, **kwargs)

    def delete(self, url, **kwargs):
        return self.request("DELETE", url, **kwargs)

    def close(self):
        pass


@pytest.fixture
def test_db():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    db = factory()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(engine)
        engine.dispose()


@pytest.fixture
def api_client(test_db):
    def override_db():
        yield test_db

    app.dependency_overrides[get_db] = override_db
    client = InProcessAPIClient(app)
    yield client
    client.close()
    app.dependency_overrides.clear()


@pytest.fixture
def account(test_db, api_client):
    user = User(id="user-a", email="a@example.test", full_name="A Candidate", google_subject="google-a")
    role = CareerRole(id="role-test", title="Test Engineer", category="Engineering", description="Build test systems")
    skill = Skill(id="skill-python", name="Python", category="Programming")
    test_db.add_all([user, role, skill])
    test_db.flush()
    test_db.add(Profile(user_id=user.id, target_role_id=role.id, target_role_title=role.title))
    test_db.add(RoleSkill(role_id=role.id, skill_id=skill.id, importance="Core", weight=2.0))
    test_db.add(UserSkill(user_id=user.id, skill_id=skill.id, proficiency="Moderate", source="Test"))
    raw_token = secrets.token_urlsafe(48)
    test_db.add(UserSession(
        user_id=user.id,
        token_hash=hashlib.sha256(raw_token.encode()).hexdigest(),
        expires_at=__import__("datetime").datetime.utcnow() + __import__("datetime").timedelta(days=1),
    ))
    test_db.commit()
    api_client.cookies.set("cb_session", raw_token)
    api_client.cookies.set("cb_csrf", "csrf-a")
    api_client.headers.update({"X-CSRF-Token": "csrf-a", "Origin": "http://localhost:3000"})
    return {"user": user, "role": role, "skill": skill}
