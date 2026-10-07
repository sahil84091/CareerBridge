from unittest.mock import patch
from backend.app.models.entities import Profile, UserSkill, Skill


def test_link_and_unlink_github(api_client, account, test_db):
    user = account["user"]
    mock_gh_data = {
        "username": "octocat",
        "profile_url": "https://github.com/octocat",
        "name": "The Octocat",
        "bio": "Building social coding tools.",
        "avatar_url": "https://avatars.githubusercontent.com/u/583231",
        "public_repos": 8,
        "followers": 1500,
        "languages": ["TypeScript", "Python"],
        "topics": ["developer-tools"],
        "top_repositories": [
            {
                "name": "Hello-World",
                "description": "My first repo",
                "stars": 120,
                "forks": 45,
                "language": "TypeScript",
                "topics": ["starter"],
                "url": "https://github.com/octocat/Hello-World",
            }
        ],
        "detected_skills": ["TypeScript", "Python", "Git"],
        "synced_at": "2026-10-07T12:00:00",
    }

    with patch("backend.app.services.social_profile.SocialProfileService.sync_github", return_value=mock_gh_data):
        res = api_client.post("/api/profile/link/github", json={"github_url": "https://github.com/octocat"})
        assert res.status_code == 200
        data = res.json()
        assert data["github_data"]["username"] == "octocat"
        assert data["github_url"] == "https://github.com/octocat"

        # Verify auto-synced skills into user portfolio
        user_skills = test_db.query(UserSkill).filter(UserSkill.user_id == user.id).all()
        skill_names = [us.skill.name for us in user_skills]
        assert "TypeScript" in skill_names
        assert "Python" in skill_names

    # Test unlink github
    unlink_res = api_client.delete("/api/profile/link/github")
    assert unlink_res.status_code == 200
    assert unlink_res.json()["github_data"] is None
    assert unlink_res.json()["github_url"] is None


def test_link_and_unlink_linkedin(api_client, account, test_db):
    user = account["user"]
    mock_li_data = {
        "handle": "john-doe",
        "profile_url": "https://www.linkedin.com/in/john-doe",
        "headline": "Senior Full-Stack Engineer at CloudCorp",
        "summary": "Building high-performance distributed systems in Go and React.",
        "detected_skills": ["Go", "React", "Docker"],
        "synced_at": "2026-10-07T12:00:00",
    }

    with patch("backend.app.services.social_profile.SocialProfileService.sync_linkedin", return_value=mock_li_data):
        res = api_client.post(
            "/api/profile/link/linkedin",
            json={
                "linkedin_url": "https://linkedin.com/in/john-doe",
                "headline": "Senior Full-Stack Engineer",
                "summary": "Building distributed systems in Go and React",
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert data["linkedin_data"]["handle"] == "john-doe"
        assert data["linkedin_url"] == "https://www.linkedin.com/in/john-doe"

        # Verify skills added
        user_skills = test_db.query(UserSkill).filter(UserSkill.user_id == user.id).all()
        skill_names = [us.skill.name for us in user_skills]
        assert "React" in skill_names

    # Test unlink linkedin
    unlink_res = api_client.delete("/api/profile/link/linkedin")
    assert unlink_res.status_code == 200
    assert unlink_res.json()["linkedin_data"] is None
    assert unlink_res.json()["linkedin_url"] is None


def test_profile_enhancements_endpoint(api_client, account, test_db):
    user = account["user"]
    profile = test_db.query(Profile).filter(Profile.user_id == user.id).first()
    profile.github_data = {
        "username": "testdev",
        "languages": ["Python", "JavaScript"],
        "top_repositories": [
            {
                "name": "microservices-api",
                "description": "High performance API",
                "stars": 15,
                "forks": 3,
                "language": "Python",
                "topics": ["api"],
                "url": "https://github.com/testdev/microservices-api",
            }
        ],
        "detected_skills": ["Python", "JavaScript"],
    }
    profile.linkedin_data = {
        "handle": "testdev-pro",
        "headline": "Backend Engineer",
        "detected_skills": ["Docker", "PostgreSQL"],
    }
    test_db.commit()

    res = api_client.get("/api/profile/enhancements")
    assert res.status_code == 200
    data = res.json()
    assert data["synced_github"] is True
    assert data["synced_linkedin"] is True
    assert len(data["project_suggestions"]) >= 1
    assert len(data["resume_enhancements"]) >= 1
    assert len(data["personalized_roles"]) >= 1

    first_proj = data["project_suggestions"][0]
    assert "title" in first_proj
    assert "impact_bullet_points" in first_proj
    assert len(first_proj["impact_bullet_points"]) >= 1
