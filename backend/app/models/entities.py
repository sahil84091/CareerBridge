import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import relationship
from backend.app.database.session import Base


def generate_id():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_id)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    password_hash = Column(String, nullable=True)
    google_subject = Column(String, unique=True, index=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    skills = relationship("UserSkill", back_populates="user", cascade="all, delete-orphan")
    skill_gaps = relationship("SkillGap", back_populates="user", cascade="all, delete-orphan")
    roadmaps = relationship("Roadmap", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    preferences = relationship("UserPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")


class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(String, primary_key=True, default=generate_id)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash = Column(String, unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False, index=True)
    revoked_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="sessions")


class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(String, primary_key=True, default=generate_id)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    salary_expectation = Column(String, nullable=True)
    remote_only = Column(Boolean, nullable=False, default=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="preferences")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String, primary_key=True, default=generate_id)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    bio = Column(Text, nullable=True)
    current_title = Column(String, nullable=True)
    target_role_id = Column(String, ForeignKey("career_roles.id"), nullable=True)
    target_role_title = Column(String, nullable=True)
    experience_level = Column(String, nullable=True)
    education_level = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    github_data = Column(JSON, nullable=True)
    linkedin_data = Column(JSON, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="profile")
    target_role = relationship("CareerRole")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String, primary_key=True, default=generate_id)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=True)
    raw_text = Column(Text, nullable=True)
    parsed_data = Column(JSON, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="resumes")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(String, primary_key=True, default=generate_id)
    name = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    importance = Column(String, default="Medium")
    aliases = Column(JSON, default=list)

    # Relationships
    role_skills = relationship("RoleSkill", back_populates="skill")
    user_skills = relationship("UserSkill", back_populates="skill")


class CareerRole(Base):
    __tablename__ = "career_roles"

    id = Column(String, primary_key=True, default=generate_id)
    title = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    average_salary = Column(String, nullable=True)
    market_demand = Column(String, default="High")

    # Relationships
    required_skills = relationship("RoleSkill", back_populates="role", cascade="all, delete-orphan")


class RoleSkill(Base):
    __tablename__ = "role_skills"

    id = Column(String, primary_key=True, default=generate_id)
    role_id = Column(String, ForeignKey("career_roles.id"), nullable=False)
    skill_id = Column(String, ForeignKey("skills.id"), nullable=False)
    importance = Column(String, default="Core")
    weight = Column(Float, default=1.0)

    # Relationships
    role = relationship("CareerRole", back_populates="required_skills")
    skill = relationship("Skill", back_populates="role_skills")


class UserSkill(Base):
    __tablename__ = "user_skills"

    id = Column(String, primary_key=True, default=generate_id)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    skill_id = Column(String, ForeignKey("skills.id"), nullable=False)
    proficiency = Column(String, default="Moderate")  # Strong, Moderate, Familiar
    verified = Column(Boolean, default=False)
    source = Column(String, default="Resume")

    # Relationships
    user = relationship("User", back_populates="skills")
    skill = relationship("Skill", back_populates="user_skills")


class SkillGap(Base):
    __tablename__ = "skill_gaps"

    id = Column(String, primary_key=True, default=generate_id)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    role_id = Column(String, ForeignKey("career_roles.id"), nullable=False)
    readiness_score = Column(Float, nullable=False, default=0.0)
    matched_skills = Column(JSON, default=list)
    partial_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    priority_skills = Column(JSON, default=list)
    analyzed_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="skill_gaps")
    role = relationship("CareerRole")


class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(String, primary_key=True, default=generate_id)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    role_id = Column(String, ForeignKey("career_roles.id"), nullable=False)
    title = Column(String, nullable=False)
    target_duration = Column(String, default="12 Weeks")
    current_progress = Column(Float, default=0.0)
    generated_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="roadmaps")
    role = relationship("CareerRole")
    items = relationship("RoadmapItem", back_populates="roadmap", cascade="all, delete-orphan", order_by="RoadmapItem.phase_number")


class RoadmapItem(Base):
    __tablename__ = "roadmap_items"

    id = Column(String, primary_key=True, default=generate_id)
    roadmap_id = Column(String, ForeignKey("roadmaps.id"), nullable=False)
    phase_number = Column(Integer, nullable=False)
    phase_name = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    skills = Column(JSON, default=list)
    milestone_projects = Column(JSON, default=list)
    learning_goals = Column(JSON, default=list)
    completed_goals = Column(JSON, default=list)
    status = Column(String, default="pending")  # completed, in_progress, pending
    order_index = Column(Integer, default=0)

    # Relationships
    roadmap = relationship("Roadmap", back_populates="items")


class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(String, primary_key=True, default=generate_id)
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    location = Column(String, nullable=False)
    type = Column(String, default="Full-time")
    salary_range = Column(String, nullable=True)
    experience_level = Column(String, default="Entry to Mid")
    description = Column(Text, nullable=False)
    apply_url = Column(String, nullable=True)
    required_skills = Column(JSON, default=list)
    preferred_skills = Column(JSON, default=list)
    posted_at = Column(DateTime, default=datetime.utcnow)
    source = Column(String, default="curated", nullable=False)
    external_id = Column(String, nullable=True)
    fetched_at = Column(DateTime, nullable=True, index=True)


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String, primary_key=True, default=generate_id)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    recommended_roles = Column(JSON, default=list)
    justification = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="recommendations")
