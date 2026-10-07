import re
from typing import Any, Dict, List, Optional


# High-legitimacy recognized accreditation bodies and technology providers
TIER_1_ISSUERS = {
    "amazon": ("Amazon Web Services (AWS)", 95, "High", "Industry-standard hyperscaler certification with high industry verification."),
    "aws": ("Amazon Web Services (AWS)", 95, "High", "Industry-standard hyperscaler certification with high industry verification."),
    "google": ("Google Cloud (GCP)", 95, "High", "Official Google Cloud professional/associate credential with high industry credibility."),
    "gcp": ("Google Cloud (GCP)", 95, "High", "Official Google Cloud professional/associate credential with high industry credibility."),
    "microsoft": ("Microsoft Azure", 95, "High", "Microsoft official role-based certification recognized globally."),
    "azure": ("Microsoft Azure", 95, "High", "Microsoft official role-based certification recognized globally."),
    "kubernetes": ("CNCF / Linux Foundation", 95, "High", "Hands-on proctored CNCF certification (CKA/CKAD/CKS) with high technical authority."),
    "cncf": ("CNCF / Linux Foundation", 95, "High", "Hands-on proctored CNCF certification with top tier industry authority."),
    "linux foundation": ("Linux Foundation", 92, "High", "Accredited open-source engineering certification."),
    "cisco": ("Cisco Systems", 92, "High", "Industry-standard networking and infrastructure certification (CCNA/CCNP/CCIE)."),
    "comptia": ("CompTIA", 90, "High", "Vendor-neutral accredited IT and cybersecurity credential (Security+, Network+, A+)."),
    "red hat": ("Red Hat", 94, "High", "Practical, hands-on enterprise Linux and OpenShift certification (RHCSA/RHCE)."),
    "hashicorp": ("HashiCorp", 92, "High", "Official infrastructure-as-code and Terraform certification."),
    "oracle": ("Oracle", 88, "High", "Official database and Java enterprise certification."),
    "meta": ("Meta", 88, "High", "Meta professional engineering certification (Frontend/Backend/Data)."),
    "apple": ("Apple", 90, "High", "Official Apple developer certification."),
    "isc2": ("ISC2", 95, "High", "Gold-standard information security certification (CISSP/CCSP)."),
    "isaca": ("ISACA", 93, "High", "Recognized enterprise governance and cybersecurity audit credential (CISA/CISM)."),
    "offensive security": ("Offensive Security", 96, "High", "Hands-on offensive penetration testing certification (OSCP)."),
    "pmi": ("Project Management Institute (PMI)", 90, "High", "Global gold-standard project management credential (PMP/CAPM)."),
    "scrum.org": ("Scrum.org", 88, "High", "Official professional agile credential (PSM I/II, PSPO)."),
    "deeplearning.ai": ("DeepLearning.AI / Andrew Ng", 92, "High", "World-renowned specialized AI/ML specialization by Andrew Ng."),
    "stanford": ("Stanford University", 95, "High", "Top-tier academic institution certification."),
    "harvard": ("Harvard University (CS50)", 95, "High", "Top-tier academic curriculum credential."),
    "mit": ("MIT Open Learning", 95, "High", "Top-tier academic institution curriculum."),
}

# Recognized MOOC platforms with quality practical coursework
TIER_2_ISSUERS = {
    "coursera": ("Coursera Professional", 72, "Medium", "Recognized multi-course professional specialization; moderate hiring signal."),
    "edx": ("edX MicroMasters", 74, "Medium", "University-backed MicroMasters or professional certificate."),
    "freecodecamp": ("freeCodeCamp", 75, "Medium", "Project-verified coding curriculum with mandatory portfolio capstones."),
    "udacity": ("Udacity Nanodegree", 75, "Medium", "Project-reviewed technical Nanodegree curriculum."),
    "linkedin": ("LinkedIn Learning", 58, "Medium", "Standard online learning completion badge; useful for basic exposure."),
    "datacamp": ("DataCamp", 68, "Medium", "Hands-on data science & Python curriculum."),
    "codecademy": ("Codecademy Pro", 62, "Medium", "Interactive coding coursework credential."),
}

# Low-priority or attendance-only certificates
TIER_3_KEYWORDS = [
    "udemy", "sololearn", "simplilearn", "internshala", "great learning",
    "workshop", "webinar", "seminar", "bootcamp attendance", "certificate of participation",
    "certificate of completion", "quiz", "hackerrank basic"
]

# Skill association map for known certifications
CERT_SKILL_MAP = {
    "aws": ["AWS", "Cloud Computing", "DevOps"],
    "azure": ["Azure", "Cloud Computing", "DevOps"],
    "gcp": ["GCP", "Google Cloud", "Cloud Computing"],
    "google cloud": ["GCP", "Google Cloud", "Cloud Computing"],
    "kubernetes": ["Kubernetes", "Docker", "DevOps", "Containerization"],
    "cka": ["Kubernetes", "Docker", "DevOps"],
    "ckad": ["Kubernetes", "Docker", "DevOps"],
    "docker": ["Docker", "DevOps", "CI/CD"],
    "terraform": ["Terraform", "Infrastructure as Code", "DevOps", "AWS"],
    "cisco": ["Networking", "Network Security", "TCP/IP"],
    "ccna": ["Networking", "Network Security", "Routing & Switching"],
    "security+": ["Cybersecurity", "Network Security", "Security Compliance"],
    "comptia": ["Cybersecurity", "Networking", "IT Support"],
    "cissp": ["Cybersecurity", "Information Security", "Security Architecture"],
    "meta front-end": ["React", "JavaScript", "HTML", "CSS", "Frontend Development"],
    "meta backend": ["Python", "Django", "APIs", "SQL", "Backend Development"],
    "deeplearning": ["Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Python"],
    "machine learning": ["Machine Learning", "Python", "Data Science"],
    "data engineer": ["SQL", "ETL Pipelines", "Data Engineering", "Python", "Big Data"],
    "scrum master": ["Agile", "Scrum", "Project Management"],
    "pmp": ["Project Management", "Agile", "Risk Management"],
    "java": ["Java", "Object-Oriented Programming"],
    "python": ["Python", "Programming"],
}


class CertificationEvaluator:
    """Evaluates the credibility, legitimacy, and priority weight of technical certifications."""

    def evaluate(self, cert_data: Any) -> Dict[str, Any]:
        """Takes a certification string or dict and returns a standardized evaluated object."""
        if isinstance(cert_data, dict):
            name = cert_data.get("name") or cert_data.get("title") or "Certification"
            issuer = cert_data.get("issuer")
            year = cert_data.get("year")
            custom_score = cert_data.get("credibility_score")
        else:
            name = str(cert_data).strip()
            issuer = None
            year = None
            custom_score = None

        # Extract year if present in text e.g. "AWS SAA (2024)"
        if not year:
            year_match = re.search(r"\b(19|20)\d{2}\b", name)
            if year_match:
                year = year_match.group(0)

        # Detect issuer from name if not provided
        lower_name = name.lower()
        detected_issuer = issuer or self._detect_issuer(lower_name)

        # Evaluate credibility score and priority level
        score, priority, is_legit, notes = self._score_certification(lower_name, detected_issuer)
        if custom_score is not None and isinstance(custom_score, (int, float)):
            score = int(custom_score)

        # Detect validated skills
        skills_validated = self._detect_validated_skills(lower_name)

        return {
            "name": name,
            "issuer": detected_issuer or "Independent Issuer",
            "year": year,
            "credibility_score": score,
            "priority_level": priority,
            "is_legitimate": is_legit,
            "skills_validated": skills_validated,
            "reputation_notes": notes,
        }

    def _detect_issuer(self, lower_name: str) -> Optional[str]:
        for key, (issuer_name, _, _, _) in TIER_1_ISSUERS.items():
            if re.search(rf"\b{re.escape(key)}\b", lower_name):
                return issuer_name
        for key, (issuer_name, _, _, _) in TIER_2_ISSUERS.items():
            if re.search(rf"\b{re.escape(key)}\b", lower_name):
                return issuer_name
        for word in TIER_3_KEYWORDS:
            if word in lower_name:
                return word.capitalize()
        return None

    def _score_certification(self, lower_name: str, issuer: Optional[str]) -> tuple[int, str, bool, str]:
        check_text = (lower_name + " " + (issuer.lower() if issuer else "")).lower()

        # Check Tier 1 (High priority)
        for key, (official_name, score, priority, notes) in TIER_1_ISSUERS.items():
            if re.search(rf"\b{re.escape(key)}\b", check_text):
                return score, priority, True, notes

        # Check Tier 2 (Medium priority)
        for key, (official_name, score, priority, notes) in TIER_2_ISSUERS.items():
            if re.search(rf"\b{re.escape(key)}\b", check_text):
                return score, priority, True, notes

        # Check Tier 3 (Low priority / non-accredited)
        for kw in TIER_3_KEYWORDS:
            if kw in check_text:
                return 35, "Low", True, "Basic course completion or unproctored certificate. Limited priority in technical hiring."

        # Default: Unverified generic
        return 25, "Unverified", False, "Unverified certification with unrecognized issuer; not prioritized in core skill scoring."

    def _detect_validated_skills(self, lower_name: str) -> List[str]:
        validated = []
        for key, skills in CERT_SKILL_MAP.items():
            if key in lower_name:
                for s in skills:
                    if s not in validated:
                        validated.append(s)
        return validated


certification_evaluator = CertificationEvaluator()
