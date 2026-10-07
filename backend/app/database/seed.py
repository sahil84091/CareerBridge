from datetime import datetime
import json
import os

from sqlalchemy.orm import Session

from backend.app.database.session import SessionLocal
from backend.app.models.entities import CareerRole, RoleSkill, Skill, Opportunity

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data"))


def seed_opportunities_into(db: Session) -> list[Opportunity]:
    """Loads sample opportunities into the provided database session."""
    opps_file = os.path.join(DATA_DIR, "opportunities", "sample_jobs.json")
    if os.path.exists(opps_file):
        with open(opps_file, "r", encoding="utf-8") as file:
            opp_list = json.load(file).get("opportunities", [])
            for item in opp_list:
                existing = db.query(Opportunity).filter(Opportunity.id == item["id"]).first()
                if not existing:
                    db.add(Opportunity(
                        id=item["id"],
                        title=item["title"],
                        company=item["company"],
                        location=item["location"],
                        type=item.get("type", "Full-time"),
                        salary_range=item.get("salary_range"),
                        experience_level=item.get("experience_level", "Entry to Mid"),
                        description=item.get("description", ""),
                        apply_url=item.get("apply_url"),
                        required_skills=item.get("required_skills", []),
                        preferred_skills=item.get("preferred_skills", []),
                        posted_at=datetime.utcnow(),
                        source=item.get("source", "Adzuna"),
                        external_id=item.get("external_id"),
                        fetched_at=datetime.utcnow(),
                    ))
                else:
                    existing.title = item["title"]
                    existing.company = item["company"]
                    existing.location = item["location"]
                    existing.type = item.get("type", "Full-time")
                    existing.salary_range = item.get("salary_range")
                    existing.experience_level = item.get("experience_level", "Entry to Mid")
                    existing.description = item.get("description", "")
                    existing.apply_url = item.get("apply_url")
                    existing.required_skills = item.get("required_skills", [])
                    existing.preferred_skills = item.get("preferred_skills", [])
                    existing.source = item.get("source", "Adzuna")
                    existing.fetched_at = datetime.utcnow()
        db.commit()
    return db.query(Opportunity).all()


def seed_database(db: Session | None = None):
    """Idempotently load public taxonomy, career-role reference data, and curated opportunities."""
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True
    try:
        if db.query(Skill).count() == 0:
            skills_file = os.path.join(DATA_DIR, "skills", "skills_taxonomy.json")
            with open(skills_file, "r", encoding="utf-8") as file:
                for item in json.load(file).get("skills", []):
                    db.add(Skill(
                        id=item["id"], name=item["name"], category=item["category"],
                        description=item.get("description", ""), importance=item.get("importance", "Medium"),
                        aliases=item.get("aliases", []),
                    ))
            db.flush()
        if db.query(CareerRole).count() == 0:
            roles_file = os.path.join(DATA_DIR, "careers", "career_roles.json")
            with open(roles_file, "r", encoding="utf-8") as file:
                for role_data in json.load(file).get("roles", []):
                    role = CareerRole(
                        id=role_data["id"], title=role_data["title"], category=role_data["category"],
                        description=role_data["description"], average_salary=role_data.get("average_salary"),
                        market_demand=role_data.get("market_demand", "High"),
                    )
                    db.add(role)
                    db.flush()
                    for required in role_data.get("required_skills", []):
                        skill = db.query(Skill).filter(Skill.name.ilike(required["skill_name"])).first()
                        if not skill:
                            skill = Skill(name=required["skill_name"], category="Technical")
                            db.add(skill)
                            db.flush()
                        db.add(RoleSkill(
                            role_id=role.id,
                            skill_id=skill.id,
                            importance=required.get("importance", "Core"),
                            weight=float(required.get("weight", 1.0)),
                        ))

        seed_opportunities_into(db)
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        if should_close:
            db.close()
