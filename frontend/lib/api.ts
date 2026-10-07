import type {
  CareerRecommendation,
  CareerRole,
  DashboardData,
  Opportunity,
  Profile,
  ProfileEnhancementResponse,
  ResumeAnalysis,
  Roadmap,
  RoadmapPhase,
  SkillGapAnalysis,
  SkillItem,
  User,
  UserSkillItem,
  UserPreferences,
} from "@/types";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const TIMEOUT_MS = 15_000;
export type DataSource = "live";
export interface ApiResult<T> { data: T; source: DataSource; }

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

function cookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const entry = document.cookie.split("; ").find((item) => item.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : undefined;
}

async function request<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const isForm = typeof FormData !== "undefined" && init?.body instanceof FormData;
    const headers = new Headers(init?.headers);
    if (!isForm && init?.body !== undefined) headers.set("Content-Type", "application/json");
    const csrf = cookie("cb_csrf");
    if (csrf && ["POST", "PUT", "PATCH", "DELETE"].includes((init?.method ?? "GET").toUpperCase())) {
      headers.set("X-CSRF-Token", csrf);
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...init,
      headers,
      credentials: "include",
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) {
      let message = response.statusText || "Request failed";
      try {
        const body = (await response.json()) as { detail?: string };
        message = body.detail || message;
      } catch { /* retain status text for non-JSON errors */ }
      throw new ApiError(message, response.status);
    }
    if (response.status === 204) return undefined as T;
    return await response.json() as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(error instanceof Error && error.name === "AbortError" ? "Request timed out" : "Backend unreachable");
  } finally {
    clearTimeout(timer);
  }
}

async function live<T>(call: () => Promise<T>): Promise<ApiResult<T>> {
  return { data: await call(), source: "live" };
}
const query = (params: Record<string, string | undefined>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => value && search.set(key, value));
  const suffix = search.toString();
  return suffix ? `?${suffix}` : "";
};

export const api = {
  health: () => request<{ status: string }>("/api/health"),
  ready: () => request<{ status: string; database: string }>("/api/ready"),
  currentUser: () => request<User>("/api/auth/me"),
  startGoogleLogin: () => {
    // This intentionally leaves Next.js for the API's Google OAuth redirect.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  },
  logout: () => request<void>("/api/auth/logout", { method: "POST" }),
  getDashboard: () => live(() => request<DashboardData>("/api/dashboard")),
  getProfile: () => live(() => request<Profile>("/api/profile")),
  updateProfile: (data: Partial<Profile>) => request<Profile>("/api/profile", { method: "PUT", body: JSON.stringify(data) }),
  linkGitHub: (github_url: string) => request<Profile>("/api/profile/link/github", {
    method: "POST", body: JSON.stringify({ github_url }),
  }),
  unlinkGitHub: () => request<Profile>("/api/profile/link/github", { method: "DELETE" }),
  linkLinkedIn: (payload: { linkedin_url: string; headline?: string; summary?: string; skills_text?: string }) =>
    request<Profile>("/api/profile/link/linkedin", {
      method: "POST", body: JSON.stringify(payload),
    }),
  unlinkLinkedIn: () => request<Profile>("/api/profile/link/linkedin", { method: "DELETE" }),
  getProfileEnhancements: () => live(() => request<ProfileEnhancementResponse>("/api/profile/enhancements")),
  getPreferences: () => live(() => request<UserPreferences>("/api/preferences")),
  updatePreferences: (data: UserPreferences) => request<UserPreferences>("/api/preferences", { method: "PUT", body: JSON.stringify(data) }),
  getUserSkills: () => live(() => request<UserSkillItem[]>("/api/skills/user")),
  getTaxonomy: () => live(() => request<SkillItem[]>("/api/skills")),
  addUserSkill: (skill_name: string, proficiency = "Moderate") => request<UserSkillItem>("/api/skills/user", {
    method: "POST", body: JSON.stringify({ skill_name, proficiency }),
  }),
  deleteUserSkill: (id: string) => request<{ status: string }>(`/api/skills/user/${encodeURIComponent(id)}`, { method: "DELETE" }),
  getCareers: () => live(() => request<CareerRole[]>("/api/careers")),
  recommendCareers: () => live(async () => (await request<{ recommendations: CareerRecommendation[] }>("/api/careers/recommend", { method: "POST" })).recommendations),
  analyzeSkillGap: (roleId?: string) => live(() => request<SkillGapAnalysis>("/api/skill-gap/analyze", {
    method: "POST", body: JSON.stringify({ role_id: roleId }),
  })),
  getRoadmap: () => live(() => request<Roadmap>("/api/roadmap/current")),
  generateRoadmap: (roleId?: string) => live(() => request<Roadmap>(`/api/roadmap/generate${query({ role_id: roleId })}`, { method: "POST" })),
  updateRoadmapItem: (id: string, data: Partial<Pick<RoadmapPhase, "status" | "completed_goals">>) =>
    request<Roadmap>(`/api/roadmap/items/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(data) }),
  getOpportunities: (type?: string, role?: string, location?: string) => live(() =>
    request<Opportunity[]>(`/api/opportunities${query({ type_filter: type === "all" ? undefined : type, role_filter: role, location })}`)),
  getLatestResume: () => live(() => request<ResumeAnalysis>("/api/resume/latest")),
  uploadResume: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return live(() => request<ResumeAnalysis>("/api/resume/upload", { method: "POST", body: form }));
  },
};
