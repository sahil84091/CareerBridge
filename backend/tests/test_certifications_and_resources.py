from backend.app.ai.certification_evaluator import certification_evaluator
from backend.app.ai.learning_resources import get_curated_resources_for_skills, build_structured_plan
from backend.app.ai.skill_gap_engine import skill_gap_engine


def test_certification_evaluator_scores_tier1_legitimate_issuers():
    # Test AWS certification
    res_aws = certification_evaluator.evaluate("AWS Certified Solutions Architect Associate")
    assert res_aws["credibility_score"] >= 90
    assert res_aws["priority_level"] == "High"
    assert res_aws["is_legitimate"] is True
    assert "AWS" in res_aws["skills_validated"]

    # Test Kubernetes / CKA certification
    res_k8s = certification_evaluator.evaluate("Certified Kubernetes Administrator (CKA)")
    assert res_k8s["credibility_score"] >= 90
    assert res_k8s["priority_level"] == "High"
    assert "Kubernetes" in res_k8s["skills_validated"]

    # Test Meta certification
    res_meta = certification_evaluator.evaluate("Meta Front-End Developer Certificate")
    assert res_meta["credibility_score"] >= 80
    assert res_meta["priority_level"] == "High"


def test_certification_evaluator_scores_low_tier_or_unverified():
    # Udemy / webinar attendance
    res_udemy = certification_evaluator.evaluate("Udemy Complete Web Development Bootcamp")
    assert res_udemy["credibility_score"] <= 40
    assert res_udemy["priority_level"] == "Low"

    # Completely unknown certificate
    res_unknown = certification_evaluator.evaluate("Random Club Certificate of Attendance")
    assert res_unknown["credibility_score"] <= 35
    assert res_unknown["priority_level"] in ["Low", "Unverified"]


def test_skill_gap_engine_incorporates_credential_bonus():
    user_skills = [{"skill_name": "Python", "proficiency": "Moderate"}]
    role_skills = [
        {"skill_name": "Python", "importance": "Core", "weight": 1.0, "category": "Technical"},
        {"skill_name": "Docker", "importance": "Core", "weight": 1.0, "category": "Technical"},
    ]

    # Without certs
    gap_no_certs = skill_gap_engine.analyze_gap(user_skills, role_skills, "Backend Engineer", certifications=[])
    
    # With Tier 1 certs (AWS & CKA)
    gap_with_certs = skill_gap_engine.analyze_gap(
        user_skills,
        role_skills,
        "Backend Engineer",
        certifications=["AWS Certified Solutions Architect", "CKA Kubernetes Administrator"],
    )

    assert gap_with_certs["readiness_score"] > gap_no_certs["readiness_score"]
    assert len(gap_with_certs["certifications_summary"]) == 2
    assert len(gap_with_certs["curated_resources"]) > 0
    assert len(gap_with_certs["structured_plan"]) > 0


def test_curated_learning_resources_and_structured_plan():
    resources = get_curated_resources_for_skills(["Docker", "Kubernetes"])
    assert len(resources) >= 2
    assert any("Docker" in r["title"] or "Docker" in r["skill"] for r in resources)
    assert any("Nana" in r["platform"] or "freeCodeCamp" in r["platform"] for r in resources)

    plan = build_structured_plan(["Docker", "Kubernetes", "AWS"], "DevOps Engineer")
    assert len(plan) == 4
    assert plan[0]["step_number"] == 1
    assert "estimated_weeks" in plan[0]
    assert plan[0]["recommended_video"] is not None


def test_matched_opportunities_fallback_and_filtering(test_db, account):
    from backend.app.services.adzuna import matched_opportunities, cached_matched_opportunities
    from backend.app.database.seed import seed_database

    seed_database()

    # All opportunities
    all_opps = matched_opportunities(test_db, account["user"], refresh=False)
    assert len(all_opps) >= 10
    assert all("match_score" in o for o in all_opps)

    # Filter by internship
    internships = matched_opportunities(test_db, account["user"], type_filter="internship", refresh=False)
    assert len(internships) >= 5
    for item in internships:
        assert "intern" in item["type"].lower() or "intern" in item["title"].lower()

    # Filter by full-time
    full_time = matched_opportunities(test_db, account["user"], type_filter="full-time", refresh=False)
    assert len(full_time) >= 5
    for item in full_time:
        assert "full" in item["type"].lower()

    # Dashboard cached matched
    dashboard_matches = cached_matched_opportunities(test_db, account["user"], limit=4)
    assert len(dashboard_matches) == 4

