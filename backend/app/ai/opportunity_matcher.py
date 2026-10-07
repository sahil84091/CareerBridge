from typing import List, Dict, Any
from backend.app.ai.taxonomy import taxonomy


class OpportunityMatcherService:
    def match_opportunity(
        self,
        user_skills: List[str],
        opportunity: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Calculates match score between candidate skills and an opportunity.
        """
        user_skills_norm = set()
        for s in user_skills:
            norm = taxonomy.normalize(s)
            if norm:
                user_skills_norm.add(norm.lower())

        req_skills = opportunity.get("required_skills", [])
        pref_skills = opportunity.get("preferred_skills", [])

        matched = []
        missing = []

        for req in req_skills:
            req_norm = taxonomy.normalize(req) or req
            if req_norm.lower() in user_skills_norm:
                matched.append(req_norm)
            else:
                missing.append(req_norm)

        # Match score calculation
        total_req = len(req_skills) if req_skills else 1
        base_score = (len(matched) / total_req) * 85.0

        # Preferred skills bonus
        pref_matched = 0
        for pref in pref_skills:
            pref_norm = taxonomy.normalize(pref) or pref
            if pref_norm.lower() in user_skills_norm:
                pref_matched += 1

        pref_bonus = min((pref_matched * 5.0), 15.0)
        final_score = round(min(base_score + pref_bonus, 100.0), 1)

        return {
            "id": opportunity.get("id"),
            "title": opportunity.get("title"),
            "company": opportunity.get("company"),
            "location": opportunity.get("location"),
            "type": opportunity.get("type", "Full-time"),
            "salary_range": opportunity.get("salary_range"),
            "experience_level": opportunity.get("experience_level", "Entry to Mid"),
            "description": opportunity.get("description"),
            "apply_url": opportunity.get("apply_url"),
            "required_skills": req_skills,
            "preferred_skills": pref_skills,
            "match_score": final_score,
            "matched_skills": matched,
            "missing_skills": missing,
        }


opportunity_matcher = OpportunityMatcherService()
