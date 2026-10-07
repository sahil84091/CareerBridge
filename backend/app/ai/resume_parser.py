import io
import re
from typing import Dict, Any, List
from pypdf import PdfReader
from backend.app.ai.taxonomy import taxonomy


class ResumeParserService:
    def extract_text_from_pdf(self, file_bytes: bytes) -> str:
        try:
            reader = PdfReader(io.BytesIO(file_bytes))
            if len(reader.pages) > 100:
                raise ValueError("PDF exceeds the 100 page limit")
            text_parts = []
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text_parts.append(extracted)
            return "\n".join(text_parts)
        except Exception as e:
            print(f"Error parsing PDF with pypdf: {e}")
            return ""

    def parse_resume_content(self, raw_text: str) -> Dict[str, Any]:
        """
        Extracts structured resume data:
        - education
        - experience
        - skills
        - projects
        - certifications
        """
        lines = [line.strip() for line in raw_text.split("\n") if line.strip()]
        
        # 1. Extract contact details (email, candidate name)
        email_match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", raw_text)
        email = email_match.group(0) if email_match else None

        name = None
        if lines:
            # First non-trivial line usually is candidate name
            first_line = lines[0]
            if len(first_line.split()) <= 4 and "@" not in first_line:
                name = first_line

        # 2. Extract skills using canonical taxonomy matching
        extracted_skills = self._extract_skills(raw_text)

        # 3. Extract projects
        projects = self._extract_projects(raw_text)

        # 4. Extract experience
        experience = self._extract_experience(raw_text)

        # 5. Extract education
        education = self._extract_education(raw_text)

        # 6. Extract certifications
        certifications = self._extract_certifications(raw_text)

        return {
            "name": name,
            "email": email,
            "education": education,
            "experience": experience,
            "skills": extracted_skills,
            "projects": projects,
            "certifications": certifications,
        }

    def _extract_skills(self, text: str) -> List[Dict[str, Any]]:
        found_skills = {}
        lower_text = text.lower()

        # Check all known taxonomy canonical skills & aliases
        for item in taxonomy.get_all_canonical_skills():
            canonical_name = item["name"]
            aliases = [canonical_name.lower()] + [a.lower() for a in item.get("aliases", [])]

            for alias in aliases:
                # Custom boundary matching for special symbols (#, +, etc.)
                if alias in {"c", "r"}:
                    pattern = r"(?<![a-zA-Z0-9_])" + re.escape(alias) + r"(?![a-zA-Z0-9_#+])"
                elif "#" in alias or "+" in alias or "." in alias:
                    pattern = r"(?<![a-zA-Z0-9_])" + re.escape(alias) + r"(?![a-zA-Z0-9_])"
                else:
                    pattern = r"\b" + re.escape(alias) + r"\b"

                if re.search(pattern, lower_text):
                    if canonical_name not in found_skills:
                        found_skills[canonical_name] = {
                            "name": canonical_name,
                            "category": item.get("category", "General"),
                            "proficiency": "Strong" if ("senior" in lower_text or "proficient" in lower_text) else "Moderate",
                            "importance": item.get("importance", "Medium"),
                        }
                    break

        return list(found_skills.values())

    def _extract_projects(self, text: str) -> List[Dict[str, Any]]:
        projects = []
        project_keywords = ["portfolio", "e-commerce", "dashboard", "api", "platform", "ai", "app", "service"]
        lines = text.split("\n")
        current_project = None

        for line in lines:
            line_str = line.strip()
            if not line_str:
                continue

            lower_line = line_str.lower()
            if any(k in lower_line for k in ["project:", "projects", "featured work"]):
                continue

            # Detect project title line
            if any(k in lower_line for k in project_keywords) and len(line_str.split()) < 8 and ("-" in line_str or ":" in line_str or "|" in line_str):
                parts = re.split(r"[-|:]", line_str, maxsplit=1)
                title = parts[0].strip()
                desc = parts[1].strip() if len(parts) > 1 else ""
                current_project = {
                    "title": title,
                    "description": desc,
                    "technologies": [skill["name"] for skill in self._extract_skills(desc)]
                }
                projects.append(current_project)
                if len(projects) >= 4:
                    break

        return projects

    def _extract_experience(self, text: str) -> List[Dict[str, Any]]:
        exp_list = []
        return exp_list

    def _extract_education(self, text: str) -> List[Dict[str, Any]]:
        lines = [line.strip(" •-\t") for line in text.splitlines() if line.strip()]
        result = []
        degree_terms = ("bachelor", "master", "associate", "b.s.", "b.a.", "b.tech", "m.s.", "m.a.", "ph.d", "doctorate")
        for line in lines:
            if any(term in line.lower() for term in degree_terms):
                year = re.search(r"(?:19|20)\d{2}", line)
                result.append({"degree": line, "institution": None, "graduation_year": year.group(0) if year else None})
        return result

    def _extract_certifications(self, text: str) -> List[Dict[str, Any]]:
        from backend.app.ai.certification_evaluator import certification_evaluator
        raw_certs = []
        in_section = False
        headings = {"certification", "certifications", "licenses", "licences", "certificates", "credentials"}
        other_sections = {"education", "experience", "projects", "skills", "summary", "profile", "work history"}
        
        # 1. Section-based extraction
        for line in text.splitlines():
            value = line.strip(" •-\t*#")
            normalized = value.lower().rstrip(":")
            if normalized in headings:
                in_section = True
                continue
            if in_section and normalized in other_sections:
                in_section = False
            elif in_section and value and len(value) > 3:
                raw_certs.append(value)

        # 2. Inline pattern scanning for prominent certifications if none found in dedicated section
        if not raw_certs:
            known_cert_patterns = [
                r"(?:aws|amazon)\s+(?:certified\s+)?[\w\s\-]+(?:associate|professional|specialty|practitioner)?",
                r"(?:google\s+cloud|gcp)\s+(?:certified\s+)?[\w\s\-]+",
                r"(?:microsoft|azure)\s+(?:certified\s+)?[\w\s\-]+",
                r"(?:cka|ckad|cks|certified\s+kubernetes\s+[\w\s\-]+)",
                r"(?:comptia\s+[\w\+\s\-]+)",
                r"(?:cisco|ccna|ccnp|ccie)\s*[\w\s\-]*",
                r"(?:meta\s+[\w\s\-]+developer\s+certificate)",
                r"(?:deeplearning\.ai\s+[\w\s\-]+specialization)",
                r"(?:hashicorp\s+certified\s+[\w\s\-]+)",
                r"(?:red\s+hat\s+certified\s+[\w\s\-]+)",
            ]
            for pat in known_cert_patterns:
                matches = re.findall(pat, text, re.IGNORECASE)
                for m in matches:
                    clean_m = m.strip(" ,.-")
                    if len(clean_m) > 4 and clean_m not in raw_certs:
                        raw_certs.append(clean_m)

        evaluated = [certification_evaluator.evaluate(c) for c in raw_certs]
        return evaluated


resume_parser = ResumeParserService()
