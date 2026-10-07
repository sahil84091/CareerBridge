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

        # If required_skills is empty, extract or infer from title and description
        if not req_skills:
            from backend.app.ai.resume_parser import resume_parser
            title_text = f"{opportunity.get('title') or ''} {opportunity.get('description') or ''}"
            extracted = resume_parser._extract_skills(title_text)
            req_skills = [item["name"] for item in extracted]
            if not req_skills:
                t_l = (opportunity.get("title") or "").lower()
                if "intern" in t_l:
                    req_skills = ["Data Structures & Algorithms", "Git", "Problem Solving"]
                elif "frontend" in t_l or "react" in t_l:
                    req_skills = ["JavaScript", "React", "HTML", "CSS", "Git"]
                elif "backend" in t_l or "python" in t_l:
                    req_skills = ["Python", "SQL", "REST API", "Git"]
                elif "full stack" in t_l:
                    req_skills = ["JavaScript", "React", "Node.js", "SQL", "Git"]
                elif "ai" in t_l or "machine learning" in t_l:
                    req_skills = ["Python", "Machine Learning", "SQL", "Git"]
                elif "cloud" in t_l or "devops" in t_l:
                    req_skills = ["Docker", "Linux", "AWS", "Git"]
                else:
                    req_skills = ["Data Structures & Algorithms", "Git", "SQL", "Problem Solving"]

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

        apply_url = opportunity.get("apply_url")
        if not apply_url:
            import urllib.parse
            q_enc = urllib.parse.quote_plus(str(opportunity.get("title") or "Software Developer"))
            w_enc = urllib.parse.quote_plus(str(opportunity.get("location") or "India"))
            apply_url = f"https://www.adzuna.in/search?q={q_enc}&w={w_enc}"

        salary_range = opportunity.get("salary_range")
        if not salary_range:
            title_l = (opportunity.get("title") or "").lower()
            type_l = (opportunity.get("type") or "").lower()
            if "intern" in title_l or "intern" in type_l:
                salary_range = "₹35,000 - ₹50,000 / month (Est.)"
            elif "lead" in title_l or "principal" in title_l or "manager" in title_l or "architect" in title_l:
                salary_range = "₹28 - ₹45 Lakh / year (Est.)"
            elif "senior" in title_l or "sr" in title_l:
                salary_range = "₹20 - ₹32 Lakh / year (Est.)"
            elif "ai" in title_l or "machine learning" in title_l or "data science" in title_l:
                salary_range = "₹18 - ₹28 Lakh / year (Est.)"
            elif "full stack" in title_l or "backend" in title_l or "cloud" in title_l or "devops" in title_l:
                salary_range = "₹14 - ₹24 Lakh / year (Est.)"
            elif "frontend" in title_l or "react" in title_l or "web" in title_l:
                salary_range = "₹10 - ₹18 Lakh / year (Est.)"
            elif "junior" in title_l or "entry" in title_l or "associate" in title_l:
                salary_range = "₹8 - ₹14 Lakh / year (Est.)"
            else:
                salary_range = "₹12 - ₹20 Lakh / year (Est.)"

        return {
            "id": opportunity.get("id"),
            "title": opportunity.get("title"),
            "company": opportunity.get("company"),
            "location": opportunity.get("location"),
            "type": opportunity.get("type", "Full-time"),
            "salary_range": salary_range,
            "experience_level": opportunity.get("experience_level", "Entry to Mid"),
            "description": opportunity.get("description"),
            "apply_url": apply_url,
            "required_skills": req_skills,
            "preferred_skills": pref_skills,
            "match_score": final_score,
            "matched_skills": matched,
            "missing_skills": missing,
            "source": opportunity.get("source") or "Adzuna",
        }


opportunity_matcher = OpportunityMatcherService()
