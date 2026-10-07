import {
  DashboardData,
  Profile,
  CareerRole,
  SkillGapAnalysis,
  Roadmap,
  Opportunity,
  UserSkillItem,
  SkillItem,
} from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API error (${res.status}): ${errorText}`);
    }

    return await res.json();
  } catch (error) {
    console.error(`Fetch failure at ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Dashboard
  getDashboard: async (userId: string = "demo_user_01"): Promise<DashboardData> => {
    return fetchJson<DashboardData>(`/api/dashboard?user_id=${userId}`);
  },

  // Profile
  getProfile: async (userId: string = "demo_user_01"): Promise<Profile> => {
    return fetchJson<Profile>(`/api/profile?user_id=${userId}`);
  },

  updateProfile: async (data: Partial<Profile>, userId: string = "demo_user_01"): Promise<Profile> => {
    return fetchJson<Profile>(`/api/profile?user_id=${userId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Careers
  getCareers: async (): Promise<CareerRole[]> => {
    return fetchJson<CareerRole[]>("/api/careers");
  },

  getCareerById: async (id: string): Promise<CareerRole> => {
    return fetchJson<CareerRole>(`/api/careers/${id}`);
  },

  // Skill Gap Analysis
  getSkillGap: async (roleId?: string, userId: string = "demo_user_01"): Promise<SkillGapAnalysis> => {
    return fetchJson<SkillGapAnalysis>(`/api/skill-gap/analyze?user_id=${userId}`, {
      method: "POST",
      body: JSON.stringify({ role_id: roleId }),
    });
  },

  // Career Roadmap
  getRoadmap: async (roleId?: string, userId: string = "demo_user_01"): Promise<Roadmap> => {
    if (roleId) {
      return fetchJson<Roadmap>(`/api/roadmap/generate?role_id=${roleId}&user_id=${userId}`, {
        method: "POST",
      });
    }
    return fetchJson<Roadmap>(`/api/roadmap/current?user_id=${userId}`);
  },

  // Opportunities
  getOpportunities: async (typeFilter?: string, userId: string = "demo_user_01"): Promise<Opportunity[]> => {
    const query = new URLSearchParams();
    if (typeFilter && typeFilter !== "all") query.append("type_filter", typeFilter);
    query.append("user_id", userId);
    return fetchJson<Opportunity[]>(`/api/opportunities?${query.toString()}`);
  },

  // User Skills
  getUserSkills: async (userId: string = "demo_user_01"): Promise<UserSkillItem[]> => {
    return fetchJson<UserSkillItem[]>(`/api/skills/user?user_id=${userId}`);
  },

  getAllTaxonomySkills: async (): Promise<SkillItem[]> => {
    return fetchJson<SkillItem[]>("/api/skills");
  },

  addUserSkill: async (
    skillName: string,
    proficiency: string = "Moderate",
    userId: string = "demo_user_01"
  ): Promise<UserSkillItem> => {
    return fetchJson<UserSkillItem>(`/api/skills/user?user_id=${userId}`, {
      method: "POST",
      body: JSON.stringify({ skill_name: skillName, proficiency }),
    });
  },

  deleteUserSkill: async (skillId: string, userId: string = "demo_user_01"): Promise<{ status: string }> => {
    return fetchJson<{ status: string }>(`/api/skills/user/${skillId}?user_id=${userId}`, {
      method: "DELETE",
    });
  },

  // Resume Upload & Extraction
  uploadResume: async (file: File, userId: string = "demo_user_01") => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE_URL}/api/resume/upload?user_id=${userId}`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Upload failed: ${await res.text()}`);
    }

    return res.json();
  },

  getLatestResume: async (userId: string = "demo_user_01") => {
    return fetchJson<any>(`/api/resume/latest?user_id=${userId}`);
  },
};
