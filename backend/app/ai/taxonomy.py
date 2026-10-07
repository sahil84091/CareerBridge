import json
import os
import re
from typing import Dict, List, Optional, Tuple

SKILLS_FILE_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../../data/skills/skills_taxonomy.json")
)


class SkillTaxonomy:
    def __init__(self):
        self.skills_by_name: Dict[str, dict] = {}
        self.alias_to_canonical: Dict[str, str] = {}
        self._load_taxonomy()

    def _load_taxonomy(self):
        if not os.path.exists(SKILLS_FILE_PATH):
            return

        try:
            with open(SKILLS_FILE_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                skills = data.get("skills", [])
                for item in skills:
                    canonical_name = item["name"]
                    self.skills_by_name[canonical_name.lower()] = item
                    self.alias_to_canonical[canonical_name.lower()] = canonical_name

                    for alias in item.get("aliases", []):
                        self.alias_to_canonical[alias.lower()] = canonical_name
        except Exception as e:
            print(f"Error loading skills taxonomy: {e}")

    def normalize(self, raw_skill_name: str) -> Optional[str]:
        if not raw_skill_name:
            return None
        cleaned = raw_skill_name.strip().lower()
        # Direct alias match
        if cleaned in self.alias_to_canonical:
            return self.alias_to_canonical[cleaned]

        # Punctuation stripped check
        stripped = re.sub(r"[^\w\s]", "", cleaned)
        if stripped in self.alias_to_canonical:
            return self.alias_to_canonical[stripped]

        # Check if canonical name is a substring or vice versa
        for canonical, item in self.skills_by_name.items():
            if canonical == cleaned or canonical in cleaned:
                return item["name"]

        return raw_skill_name.strip()

    def get_skill_details(self, canonical_name: str) -> Optional[dict]:
        return self.skills_by_name.get(canonical_name.lower())

    def get_all_canonical_skills(self) -> List[dict]:
        return list(self.skills_by_name.values())


# Singleton instance
taxonomy = SkillTaxonomy()
