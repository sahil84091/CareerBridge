import json
import os

from sqlalchemy.orm import Session

from backend.app.database.session import SessionLocal
from backend.app.models.entities import CareerRole, RoleSkill, Skill

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data"))


def seed_database():
    """Idempotently load public taxonomy and career-role reference data."""
    db: Session = SessionLocal()
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
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
