import json
import os
from sqlalchemy.orm import Session
from backend.app.database.session import SessionLocal, Base, engine
from backend.app.models.entities import (
    User,
    Profile,
    Skill,
    CareerRole,
    RoleSkill,
    UserSkill,
    SkillGap,
    Roadmap,
    RoadmapItem,
    Opportunity,
)
from backend.app.ai.skill_gap_engine import skill_gap_engine
from backend.app.ai.roadmap_generator import roadmap_generator

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data"))


def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # 1. Seed Skills Taxonomy
        if db.query(Skill).count() == 0:
            skills_file = os.path.join(DATA_DIR, "skills", "skills_taxonomy.json")
            if os.path.exists(skills_file):
                with open(skills_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for item in data.get("skills", []):
                        skill = Skill(
                            id=item["id"],
                            name=item["name"],
                            category=item["category"],
                            description=item.get("description", ""),
                            importance=item.get("importance", "Medium"),
                            aliases=item.get("aliases", []),
                        )
                        db.add(skill)
                db.commit()
                print("Seeded skills taxonomy successfully.")

        # 2. Seed Career Roles & RoleSkills
        if db.query(CareerRole).count() == 0:
            roles_file = os.path.join(DATA_DIR, "careers", "career_roles.json")
            if os.path.exists(roles_file):
                with open(roles_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for r_data in data.get("roles", []):
                        role = CareerRole(
                            id=r_data["id"],
                            title=r_data["title"],
                            category=r_data["category"],
                            description=r_data["description"],
                            average_salary=r_data.get("average_salary"),
                            market_demand=r_data.get("market_demand", "High"),
                        )
                        db.add(role)
                        db.flush()

                        # Link required skills
                        for req in r_data.get("required_skills", []):
                            skill_record = (
                                db.query(Skill)
                                .filter(Skill.name.ilike(req["skill_name"]))
                                .first()
                            )
                            if not skill_record:
                                skill_record = Skill(
                                    name=req["skill_name"],
                                    category="Technical",
                                    importance=req.get("importance", "Core"),
                                )
                                db.add(skill_record)
                                db.flush()

                            role_skill = RoleSkill(
                                role_id=role.id,
                                skill_id=skill_record.id,
                                importance=req.get("importance", "Core"),
                                weight=float(req.get("weight", 1.0)),
                            )
                            db.add(role_skill)

                db.commit()
                print("Seeded career roles successfully.")

        # 3. Seed Sample Opportunities
        if db.query(Opportunity).count() == 0:
            opp_file = os.path.join(DATA_DIR, "opportunities", "sample_jobs.json")
            if os.path.exists(opp_file):
                with open(opp_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for item in data.get("opportunities", []):
                        opp = Opportunity(
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
                        )
                        db.add(opp)
                db.commit()
                print("Seeded opportunities successfully.")

        # 4. Seed Demo User
        demo_user = db.query(User).filter(User.email == "demo@careerbridge.ai").first()
        if not demo_user:
            demo_user = User(
                id="demo_user_01",
                email="demo@careerbridge.ai",
                full_name="Demo User",
                password_hash="demo_password_hash",
            )
            db.add(demo_user)
            db.flush()

            fullstack_role = (
                db.query(CareerRole)
                .filter(CareerRole.title == "Full Stack Developer")
                .first()
            )
            role_id = fullstack_role.id if fullstack_role else None

            # Profile
            profile = Profile(
                user_id=demo_user.id,
                bio="Aspiring full-stack engineer passionate about building responsive, intelligent web platforms.",
                current_title="Junior Web Developer",
                target_role_id=role_id,
                target_role_title="Full Stack Developer",
                experience_level="Entry Level (1 year)",
                education_level="B.S. in Computer Science",
                github_url="https://github.com/demouser",
                linkedin_url="https://linkedin.com/in/demouser",
            )
            db.add(profile)

            # Pre-populate demo skills
            demo_skills_data = [
                ("JavaScript", "Strong"),
                ("HTML", "Strong"),
                ("CSS", "Strong"),
                ("Git", "Strong"),
                ("React", "Moderate"),
                ("Node.js", "Moderate"),
                ("Python", "Moderate"),
                ("TypeScript", "Familiar"),
                ("SQL", "Familiar"),
            ]

            user_skill_records = []
            for s_name, prof in demo_skills_data:
                skill_obj = db.query(Skill).filter(Skill.name.ilike(s_name)).first()
                if not skill_obj:
                    skill_obj = Skill(name=s_name, category="Development")
                    db.add(skill_obj)
                    db.flush()

                user_skill = UserSkill(
                    user_id=demo_user.id,
                    skill_id=skill_obj.id,
                    proficiency=prof,
                    verified=True,
                    source="Resume & Assessment",
                )
                db.add(user_skill)
                user_skill_records.append({"skill_name": s_name, "proficiency": prof})

            db.flush()

            # Generate initial Skill Gap & Roadmap
            if fullstack_role:
                role_skills = []
                for rs in fullstack_role.required_skills:
                    role_skills.append({
                        "skill_name": rs.skill.name,
                        "category": rs.skill.category,
                        "importance": rs.importance,
                        "weight": rs.weight,
                    })

                gap_result = skill_gap_engine.analyze_gap(
                    user_skills=user_skill_records,
                    role_skills=role_skills,
                    role_title="Full Stack Developer",
                )

                skill_gap = SkillGap(
                    user_id=demo_user.id,
                    role_id=fullstack_role.id,
                    readiness_score=gap_result["readiness_score"],
                    matched_skills=gap_result["matched_skills"],
                    partial_skills=gap_result["partial_skills"],
                    missing_skills=gap_result["missing_skills"],
                    priority_skills=gap_result["priority_skills"],
                )
                db.add(skill_gap)
                db.flush()

                # Generate Roadmap
                roadmap_phases = roadmap_generator.generate_roadmap(
                    role_title="Full Stack Developer",
                    missing_skills=[m["name"] for m in gap_result["missing_skills"]],
                    partial_skills=[p["name"] for p in gap_result["partial_skills"]],
                    matched_skills=[m["name"] for m in gap_result["matched_skills"]],
                )

                roadmap = Roadmap(
                    user_id=demo_user.id,
                    role_id=fullstack_role.id,
                    title="Full Stack Developer Mastery Path",
                    target_duration="12 Weeks",
                    current_progress=35.0,
                )
                db.add(roadmap)
                db.flush()

                for phase in roadmap_phases:
                    item = RoadmapItem(
                        roadmap_id=roadmap.id,
                        phase_number=phase["phase_number"],
                        phase_name=phase["phase_name"],
                        title=phase["title"],
                        description=phase["description"],
                        skills=phase["skills"],
                        milestone_projects=phase["milestone_projects"],
                        learning_goals=phase["learning_goals"],
                        status=phase["status"],
                        order_index=phase["phase_number"],
                    )
                    db.add(item)

            db.commit()
            print("Seeded Demo User and initial intelligence data successfully.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
