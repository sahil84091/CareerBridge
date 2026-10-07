from datetime import datetime, timedelta
import logging

import httpx
from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.app.ai.resume_parser import resume_parser
from backend.app.config import get_settings
from backend.app.models.entities import Opportunity, User, UserSkill
from backend.app.ai.opportunity_matcher import opportunity_matcher

logger = logging.getLogger(__name__)


def _salary(minimum, maximum):
    if minimum and maximum:
        return f"{int(minimum):,}–{int(maximum):,}"
    if minimum:
        return f"From {int(minimum):,}"
    if maximum:
        return f"Up to {int(maximum):,}"
    return None


def _cached(db: Session, country: str, max_age: timedelta) -> list[Opportunity]:
    return (
        db.query(Opportunity)
        .filter(
            Opportunity.source == f"adzuna:{country}",
            Opportunity.fetched_at >= datetime.utcnow() - max_age,
        )
        .order_by(Opportunity.fetched_at.desc())
        .limit(100)
        .all()
    )


def _fetch_and_cache(db: Session, role_filter: str | None, location: str | None, type_filter: str | None, remote_only: bool) -> list[Opportunity]:
    settings = get_settings()
    if not settings.adzuna_app_id or not settings.adzuna_app_key:
        raise HTTPException(status_code=503, detail="Live job search is not configured")
    query = role_filter or "software developer"
    if remote_only:
        query = f"{query} remote"
    if type_filter and type_filter.lower() not in {"all", "full-time"}:
        query = f"{query} {type_filter}"
    url = f"https://api.adzuna.com/v1/api/jobs/{settings.adzuna_country}/search/1"
    try:
        response = httpx.get(
            url,
            params={
                "app_id": settings.adzuna_app_id,
                "app_key": settings.adzuna_app_key,
                "results_per_page": min(max(settings.adzuna_results_per_page, 1), 50),
                "what": query,
                "where": location or "India",
                "content-type": "application/json",
            },
            timeout=12.0,
        )
        response.raise_for_status()
        rows = response.json().get("results", [])
    except (httpx.HTTPError, ValueError, KeyError) as exc:
        logger.warning("Adzuna request failed: %s", exc)
        raise HTTPException(status_code=503, detail="Live job search is temporarily unavailable") from exc

    now = datetime.utcnow()
    result = []
    source = f"adzuna:{settings.adzuna_country}"
    for row in rows:
        external_id = str(row.get("id", ""))
        if not external_id:
            continue
        opportunity = db.query(Opportunity).filter(
            Opportunity.source == source, Opportunity.external_id == external_id
        ).first()
        description = row.get("description") or ""
        extracted = resume_parser._extract_skills(description)
        required_skills = [item["name"] for item in extracted]
        title = row.get("title") or "Opportunity"
        category = row.get("category") or {}
        contract_time = (row.get("contract_time") or "").lower()
        contract_kind = (row.get("contract_type") or "").lower()
        if "intern" in title.lower() or "apprentice" in contract_kind:
            contract = "Internship"
        elif contract_time == "full_time" or contract_kind == "permanent":
            contract = "Full-time"
        elif contract_time == "part_time":
            contract = "Part-time"
        elif contract_time:
            contract = contract_time.replace("_", "-").title()
        elif contract_kind:
            contract = contract_kind.replace("_", "-").title()
        else:
            contract = "Not specified"
        created = row.get("created")
        try:
            posted = datetime.fromisoformat(created.replace("Z", "+00:00")).replace(tzinfo=None) if created else now
        except ValueError:
            posted = now
        values = {
            "title": title,
            "company": (row.get("company") or {}).get("display_name") or "Unknown company",
            "location": (row.get("location") or {}).get("display_name") or "India",
            "type": contract,
            "salary_range": _salary(row.get("salary_min"), row.get("salary_max")),
            "experience_level": "Not specified",
            "description": description,
            "apply_url": row.get("redirect_url"),
            "required_skills": required_skills,
            "preferred_skills": [],
            "posted_at": posted,
            "source": source,
            "external_id": external_id,
            "fetched_at": now,
        }
        if opportunity:
            for key, value in values.items():
                setattr(opportunity, key, value)
        else:
            opportunity = Opportunity(**values)
            db.add(opportunity)
        result.append(opportunity)
    db.commit()
    for item in result:
        db.refresh(item)
    return result


def matched_opportunities(
    db: Session,
    user: User,
    role_filter: str | None = None,
    type_filter: str | None = None,
    location: str | None = None,
    refresh: bool = True,
):
    settings = get_settings()
    country = settings.adzuna_country
    preference = user.preferences
    cached_fresh = _cached(db, country, timedelta(minutes=15))
    try:
        if refresh or not cached_fresh:
            opportunities = _fetch_and_cache(db, role_filter, location, type_filter, bool(preference and preference.remote_only))
        else:
            opportunities = cached_fresh
    except HTTPException:
        opportunities = _cached(db, country, timedelta(days=7))
        if not opportunities:
            raise
    if type_filter and type_filter.lower() != "all":
        opportunities = [o for o in opportunities if type_filter.lower() in (o.type or "").lower()]
    if role_filter:
        needle = role_filter.casefold()
        opportunities = [o for o in opportunities if needle in o.title.casefold() or needle in o.description.casefold()]
    if location:
        needle = location.casefold()
        opportunities = [o for o in opportunities if needle in o.location.casefold()]
    user_skills = [s.skill.name for s in db.query(UserSkill).filter(UserSkill.user_id == user.id).all()]
    output = []
    for opportunity in opportunities:
        output.append(opportunity_matcher.match_opportunity(user_skills, {
            "id": opportunity.id,
            "title": opportunity.title,
            "company": opportunity.company,
            "location": opportunity.location,
            "type": opportunity.type,
            "salary_range": opportunity.salary_range,
            "experience_level": opportunity.experience_level,
            "description": opportunity.description,
            "apply_url": opportunity.apply_url,
            "required_skills": opportunity.required_skills or [],
            "preferred_skills": opportunity.preferred_skills or [],
        }))
    return sorted(output, key=lambda item: -item["match_score"])


def cached_matched_opportunities(db: Session, user: User, limit: int = 4):
    settings = get_settings()
    opportunities = _cached(db, settings.adzuna_country, timedelta(days=7))
    if not opportunities:
        return []
    skills = [s.skill.name for s in db.query(UserSkill).filter(UserSkill.user_id == user.id).all()]
    results = [opportunity_matcher.match_opportunity(skills, {
        "id": item.id, "title": item.title, "company": item.company, "location": item.location,
        "type": item.type, "salary_range": item.salary_range, "experience_level": item.experience_level,
        "description": item.description, "apply_url": item.apply_url,
        "required_skills": item.required_skills or [], "preferred_skills": item.preferred_skills or [],
    }) for item in opportunities]
    return sorted(results, key=lambda item: -item["match_score"])[:limit]
