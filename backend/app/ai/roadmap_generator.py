from typing import List, Dict, Any


class RoadmapGeneratorService:
    def generate_roadmap(
        self,
        role_title: str,
        missing_skills: List[str],
        partial_skills: List[str],
        matched_skills: List[str],
    ) -> List[Dict[str, Any]]:
        """
        Generates structured 5-phase career roadmap:
        Phase 1: Foundation
        Phase 2: Core Skills
        Phase 3: Advanced Skills
        Phase 4: Projects
        Phase 5: Job Preparation
        """
        # Distribute missing & partial skills meaningfully across early phases
        phase1_skills = []
        phase2_skills = []
        phase3_skills = []

        combined_focus = missing_skills + partial_skills

        for skill in combined_focus:
            s_lower = skill.lower()
            if any(k in s_lower for k in ["html", "css", "git", "javascript", "python", "sql", "problem solving"]):
                phase1_skills.append(skill)
            elif any(k in s_lower for k in ["react", "next.js", "node.js", "fastapi", "express", "rest api"]):
                phase2_skills.append(skill)
            else:
                phase3_skills.append(skill)

        # Fallback defaults if list is small
        if not phase1_skills:
            phase1_skills = ["Advanced Modern JavaScript", "TypeScript Essentials", "Git Branching Workflows"]
        if not phase2_skills:
            phase2_skills = ["React State Architecture", "Node.js REST Services", "SQL Schema Optimization"]
        if not phase3_skills:
            phase3_skills = ["Docker Containerization", "AWS Cloud Deployments", "CI/CD Automation Pipelines"]

        return [
            {
                "phase_number": 1,
                "phase_name": "Phase 1: Foundation",
                "title": "Engineering Principles & Language Mastery",
                "description": f"Solidify fundamental language patterns, asynchronous execution, and version control discipline required for {role_title}.",
                "skills": phase1_skills,
                "milestone_projects": [
                    "CLI Task Runner & Git Collaboration Exercise",
                    "Modular Data Pipeline / Algorithmic Utility Library",
                ],
                "learning_goals": [
                    "Master asynchronous primitives (Promises, Async/Await, Event Loop)",
                    "Establish strict Git branch, PR review, and commit conventions",
                    "Understand algorithmic complexity and clean code structure",
                ],
                "status": "completed" if len(matched_skills) > 4 else "in_progress",
            },
            {
                "phase_number": 2,
                "phase_name": "Phase 2: Core Skills",
                "title": "Full Stack Architecture & Web Frameworks",
                "description": f"Build full-spectrum interactive clients and robust server endpoints using industry standard modern frameworks.",
                "skills": phase2_skills,
                "milestone_projects": [
                    "Production-ready CRUD API with Authentication & JWT",
                    "Reactive Client Dashboard with State Management",
                ],
                "learning_goals": [
                    "Implement clean separation of concerns between API and Client",
                    "Handle errors, input validation, and security sanitization",
                    "Integrate relational databases with ORM migrations",
                ],
                "status": "in_progress",
            },
            {
                "phase_number": 3,
                "phase_name": "Phase 3: Advanced Skills",
                "title": "DevOps, Containerization & Cloud Infrastructure",
                "description": f"Containerize backend services, configure cloud deployments, and ensure high availability.",
                "skills": phase3_skills,
                "milestone_projects": [
                    "Multi-container Docker Compose with Redis & Postgres",
                    "Automated GitHub Actions CI/CD Pipeline to AWS/Cloud",
                ],
                "learning_goals": [
                    "Write multi-stage Dockerfiles and compose setups",
                    "Deploy web services with TLS, environment secrets, and monitoring",
                    "Cache expensive queries with Redis and measure response latency",
                ],
                "status": "pending",
            },
            {
                "phase_number": 4,
                "phase_name": "Phase 4: Capstone Projects",
                "title": "Enterprise Portfolio Demonstrations",
                "description": f"Engineer comprehensive, resume-worthy capstone platforms demonstrating end-to-end expertise in {role_title}.",
                "skills": [f"{role_title} System Integration", "Performance Profiling", "Test Driven Development"],
                "milestone_projects": [
                    "Career Intelligence / AI Agent Web Platform",
                    "Real-time Collaboration Microservices Hub",
                ],
                "learning_goals": [
                    "Deliver production-grade README, architecture diagrams, and live demo links",
                    "Achieve >80% automated unit and integration test coverage",
                    "Optimize Lighthouse performance scores (>90 across metrics)",
                ],
                "status": "pending",
            },
            {
                "phase_number": 5,
                "phase_name": "Phase 5: Job Preparation",
                "title": "Talent Discovery & Technical Interview Readiness",
                "description": f"Fine-tune behavioral pitch, resume targeting, system design interview mastery, and direct opportunity applications.",
                "skills": ["System Design Architecture", "Technical Behavioral Pitch", "Live Coding Fluency"],
                "milestone_projects": [
                    "Live Portfolio Website with Case Studies",
                    "System Design Whiteboard Walkthrough Video",
                ],
                "learning_goals": [
                    "Prepare 5 structured STAR-format engineering leadership stories",
                    "Practice 15 live technical whiteboarding mock sessions",
                    "Submit 25 curated job applications with tailored cover briefs",
                ],
                "status": "pending",
            },
        ]


roadmap_generator = RoadmapGeneratorService()
