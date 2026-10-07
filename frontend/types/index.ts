export interface User {
  id: string;
  email: string;
  full_name: string;
}

export interface UserPreferences {
  salary_expectation?: string | null;
  remote_only: boolean;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  bio?: string;
  current_title?: string;
  target_role_id?: string;
  target_role_title: string;
  experience_level?: string;
  education_level?: string;
  github_url?: string;
  linkedin_url?: string;
  github_data?: {
    username?: string;
    profile_url?: string;
    name?: string;
    bio?: string;
    avatar_url?: string;
    public_repos?: number;
    followers?: number;
    languages?: string[];
    topics?: string[];
    top_repositories?: Array<{
      name: string;
      description?: string;
      stars: number;
      forks: number;
      language?: string;
      topics?: string[];
      url: string;
    }>;
    detected_skills?: string[];
    synced_at?: string;
  } | null;
  linkedin_data?: {
    handle?: string;
    profile_url?: string;
    headline?: string;
    summary?: string;
    avatar_url?: string;
    detected_skills?: string[];
    synced_at?: string;
  } | null;
}

export interface ResumeProjectSuggestion {
  title: string;
  description: string;
  target_skills: string[];
  impact_bullet_points: string[];
  source_origin: string;
  recommended_action: string;
}

export interface ProfileEnhancementResponse {
  synced_github: boolean;
  synced_linkedin: boolean;
  detected_skills: string[];
  project_suggestions: ResumeProjectSuggestion[];
  resume_enhancements: string[];
  personalized_roles: string[];
}


export interface SkillItem {
  id: string;
  name: string;
  category: string;
  description?: string;
  importance?: string;
  aliases?: string[];
}

export interface UserSkillItem {
  id: string;
  skill_name: string;
  category: string;
  proficiency: "Strong" | "Moderate" | "Familiar" | string;
  verified: boolean;
  source: string;
}

export interface RoleSkillItem {
  skill_name: string;
  category: string;
  importance: string;
  weight: number;
}

export interface CareerRole {
  id: string;
  title: string;
  category: string;
  description: string;
  average_salary?: string;
  market_demand: string;
  required_skills: RoleSkillItem[];
}

export interface ResumeCertification {
  name: string;
  issuer?: string | null;
  year?: string | null;
  credibility_score?: number;
  priority_level?: "High" | "Medium" | "Low" | "Unverified" | string;
  is_legitimate?: boolean;
  skills_validated?: string[];
  reputation_notes?: string | null;
}

export interface CuratedResource {
  title: string;
  platform: string;
  url: string;
  duration?: string | null;
  type?: "video" | "course" | "documentation" | "project";
  skill: string;
  description?: string | null;
}

export interface StructuredPlanStep {
  step_number: number;
  phase_name: string;
  title: string;
  focus_skills: string[];
  action_items: string[];
  estimated_weeks: string;
  recommended_video?: CuratedResource | null;
}

export interface SkillGapItem {
  name: string;
  category: string;
  proficiency: "Strong" | "Moderate" | "Familiar" | "Missing";
  importance: "Core" | "Important" | "Bonus" | string;
  weight: number;
}

export interface SkillGapAnalysis {
  role_id: string;
  role_title: string;
  readiness_score: number;
  matched_skills: SkillGapItem[];
  partial_skills: SkillGapItem[];
  missing_skills: SkillGapItem[];
  priority_skills: string[];
  total_required: number;
  matched_count: number;
  partial_count: number;
  missing_count: number;
  certifications_summary?: ResumeCertification[];
  curated_resources?: CuratedResource[];
  structured_plan?: StructuredPlanStep[];
}

export interface RoadmapPhase {
  id?: string;
  phase_number: number;
  phase_name: string;
  title: string;
  description: string;
  skills: string[];
  milestone_projects: string[];
  learning_goals: string[];
  completed_goals: string[];
  status: "completed" | "in_progress" | "pending";
  curated_videos?: CuratedResource[];
}

export interface Roadmap {
  id: string;
  role_id: string;
  role_title: string;
  target_duration: string;
  current_progress: number;
  phases: RoadmapPhase[];
}

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary_range?: string;
  experience_level: string;
  description: string;
  apply_url?: string;
  required_skills: string[];
  preferred_skills: string[];
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  source?: string;
}

export interface DashboardData {
  user: User;
  profile: Profile;
  target_role?: CareerRole;
  readiness_score: number;
  skill_counts: {
    matched: number;
    partial: number;
    missing: number;
  };
  top_skill_gaps: string[];
  roadmap_progress: number;
  recommended_opportunities: Opportunity[];
  recent_skills: UserSkillItem[];
}

export interface ParsedSkill {
  name: string;
  category?: string;
  proficiency?: string;
  [key: string]: unknown;
}

export interface ResumeParseOutput {
  name?: string | null;
  email?: string | null;
  education: Record<string, unknown>[];
  experience: Record<string, unknown>[];
  skills: ParsedSkill[];
  projects: Record<string, unknown>[];
  certifications: (string | ResumeCertification)[];
}

export interface ResumeAnalysis {
  resume_id: string;
  filename: string;
  parsed_data: ResumeParseOutput;
  extracted_skills_count: number;
  matched_canonical_skills: string[];
}

export interface CareerRecommendation {
  role_id: string;
  title: string;
  category: string;
  average_salary?: string;
  match_score: number;
  matched_skills: string[];
  missing_count: number;
  explanation: string;
}

