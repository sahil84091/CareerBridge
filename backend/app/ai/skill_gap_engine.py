from typing import List, Dict, Any, Tuple, Optional
from backend.app.ai.taxonomy import taxonomy
from backend.app.ai.certification_evaluator import certification_evaluator
from backend.app.ai.learning_resources import get_curated_resources_for_skills, build_structured_plan


class SkillGapEngine:
    def analyze_gap(
        self,
        user_skills: List[Dict[str, Any]],  # list of {name, proficiency}
        role_skills: List[Dict[str, Any]],  # list of {skill_name, importance, weight}
        role_title: str,
        certifications: Optional[List[Any]] = None,
    ) -> Dict[str, Any]:
        """
        Calculates:
        - matched_skills: User possesses skill strongly
        - partial_skills: User has moderate or familiar proficiency, needs improvement
        - missing_skills: User does not possess required skill
        - priority_skills: Top 3-5 critical missing/partial skills
        - readiness_score: 0 to 100 percentage incorporating skill matches and verified credential bonuses
        - certifications_summary: Evaluated certification credentials with credibility scores
        - curated_resources: Curated video and project learning materials
        - structured_plan: Multi-step guided learning sprints
        """
        # Build normalized user skills map
        user_skill_map = {}
        for s in user_skills:
            norm_name = taxonomy.normalize(s.get("name", s.get("skill_name", "")))
            if norm_name:
                user_skill_map[norm_name.lower()] = s.get("proficiency", "Moderate")

        # Evaluate and summarize certifications
        evaluated_certs = []
        credential_bonus = 0.0
        if certifications:
            for c in certifications:
                eval_c = certification_evaluator.evaluate(c)
                evaluated_certs.append(eval_c)
                # Tier scoring impact: High credibility awards higher readiness bonus
                score = eval_c.get("credibility_score", 0)
                if score >= 85:
                    credential_bonus += 4.5  # Legit recognized industry credential
                elif score >= 60:
                    credential_bonus += 2.0  # Recognized practical coursework
                else:
                    credential_bonus += 0.2  # Unverified or attendance certificate

        # Cap total credential bonus to 12.0%
        credential_bonus = min(credential_bonus, 12.0)

        matched = []
        partial = []
        missing = []

        total_weight = 0.0
        earned_weight = 0.0

        for r_skill in role_skills:
            raw_req_name = r_skill.get("skill_name", "")
            req_name = taxonomy.normalize(raw_req_name) or raw_req_name
            req_name_lower = req_name.lower()
            importance = r_skill.get("importance", "Core")
            weight = float(r_skill.get("weight", 1.0))
            category = r_skill.get("category", "Technical")

            total_weight += weight

            if req_name_lower in user_skill_map:
                prof = user_skill_map[req_name_lower]
                if prof.lower() in ["strong", "advanced", "expert"]:
                    matched.append({
                        "name": req_name,
                        "category": category,
                        "proficiency": "Strong",
                        "importance": importance,
                        "weight": weight,
                    })
                    earned_weight += weight
                elif prof.lower() in ["moderate", "intermediate"]:
                    partial.append({
                        "name": req_name,
                        "category": category,
                        "proficiency": "Moderate",
                        "importance": importance,
                        "weight": weight,
                    })
                    earned_weight += weight * 0.65
                else:  # familiar / beginner
                    partial.append({
                        "name": req_name,
                        "category": category,
                        "proficiency": "Familiar",
                        "importance": importance,
                        "weight": weight,
                    })
                    earned_weight += weight * 0.35
            else:
                missing.append({
                    "name": req_name,
                    "category": category,
                    "proficiency": "Missing",
                    "importance": importance,
                    "weight": weight,
                })

        # Calculate base readiness score percentage
        base_readiness = (
            (earned_weight / total_weight) * 100.0 if total_weight > 0 else 0.0
        )
        readiness_score = round(base_readiness + credential_bonus, 1)
        readiness_score = min(max(readiness_score, 0.0), 100.0)

        # Priority skills: sort missing skills by weight/importance (Core first), then partial skills
        missing_sorted = sorted(
            missing,
            key=lambda x: (1 if x["importance"] == "Core" else 2, -x["weight"]),
        )
        partial_sorted = sorted(
            partial,
            key=lambda x: (1 if x["importance"] == "Core" else 2, -x["weight"]),
        )

        priority_candidates = [m["name"] for m in missing_sorted] + [
            p["name"] for p in partial_sorted
        ]
        priority_skills = priority_candidates[:5]

        # Generate curated video resources and structured learning sprints
        curated_resources = get_curated_resources_for_skills(priority_skills)
        structured_plan = build_structured_plan(priority_skills, role_title)

        return {
            "readiness_score": readiness_score,
            "matched_skills": matched,
            "partial_skills": partial,
            "missing_skills": missing,
            "priority_skills": priority_skills,
            "total_required": len(role_skills),
            "matched_count": len(matched),
            "partial_count": len(partial),
            "missing_count": len(missing),
            "certifications_summary": evaluated_certs,
            "curated_resources": curated_resources,
            "structured_plan": structured_plan,
        }


skill_gap_engine = SkillGapEngine()

