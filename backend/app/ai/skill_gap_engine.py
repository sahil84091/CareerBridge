from typing import List, Dict, Any, Tuple
from backend.app.ai.taxonomy import taxonomy


class SkillGapEngine:
    def analyze_gap(
        self,
        user_skills: List[Dict[str, Any]],  # list of {name, proficiency}
        role_skills: List[Dict[str, Any]],  # list of {skill_name, importance, weight}
        role_title: str = "Full Stack Developer",
    ) -> Dict[str, Any]:
        """
        Calculates:
        - matched_skills: User possesses skill strongly
        - partial_skills: User has moderate or familiar proficiency, needs improvement
        - missing_skills: User does not possess required skill
        - priority_skills: Top 3-5 critical missing/partial skills
        - readiness_score: 0 to 100 percentage
        """
        # Build normalized user skills map
        user_skill_map = {}
        for s in user_skills:
            norm_name = taxonomy.normalize(s.get("name", s.get("skill_name", "")))
            if norm_name:
                user_skill_map[norm_name.lower()] = s.get("proficiency", "Moderate")

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

        # Calculate readiness score percentage
        readiness_score = (
            round((earned_weight / total_weight) * 100, 1) if total_weight > 0 else 0.0
        )
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
        }


skill_gap_engine = SkillGapEngine()
