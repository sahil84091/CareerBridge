/**
 * CareerBridge API client.
 *
 * Every call goes to the FastAPI backend first. If the backend is offline or
 * returns an error, read-only calls fall back to the realistic demo dataset so
 * the product (and the hackathon demo) never shows a blank screen.
 */
import type {
  AuthResponse,
  CareerRecommendation,
  CareerRole,
  DashboardData,
  Opportunity,
  Profile,
  ResumeAnalysis,
  Roadmap,
  SkillGapAnalysis,
  SkillItem,
  UserSkillItem,
} from "@/types";
import {
  DEMO_USER_ID,
  demoCareers,
  demoDashboard,
  demoOpportunities,
  demoProfile,
  demoRecommendations,
  demoResume,
  demoRoadmap,
  demoSkillGap,
  demoUserSkills,
} from "@/lib/demo-data";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
const TIMEOUT_MS = 6000;

export type DataSource = "live" | "demo";
export interface ApiResult<T> {
  data: T;
  source: DataSource;
}

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

function currentUserId(): string {
  if (typeof window === "undefined") return DEMO_USER_ID;
  return window.localStorage.getItem("cb_user_id") ?? DEMO_USER_ID;
}

async function request<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const isForm = init?.body instanceof FormData;
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...init,
      signal: controller.signal,
      headers: isForm ? init?.headers : { "Content-Type": "application/json", ...init?.headers },
      cache: "no-store",
    });
    if (!res.ok) {
      let detail = res.statusText;
      try {
        const body = (await res.json()) as { detail?: string };
        detail = body.detail ?? detail;
      } catch {
        /* non-JSON error body */
      }
      throw new ApiError(detail, res.status);
    }
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(err instanceof Error && err.name === "AbortError" ? "Request timed out" : "Backend unreachable");
  } finally {
    clearTimeout(timer);
  }
}

/** Try the live API; on failure resolve with demo data instead of throwing. */
async function withFallback<T>(call: () => Promise<T>, fallback: T): Promise<ApiResult<T>> {
  try {
    return { data: await call(), source: "live" };
  } catch {
    return { data: fallback, source: "demo" };
  }
}

const q = (params: Record<string, string | undefined>) => {
  const s = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v !== undefined && v !== "" && s.append(k, v));
  return s.toString();
};

export const api = {
  health: () => request<{ status: string }>("/api/health"),

  // ---------- Auth ----------
  login: (email: string, password: string) =>
    request<AuthResponse>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (full_name: string, email: string, password: string) =>
    request<AuthResponse>("/api/auth/register", { method: "POST", body: JSON.stringify({ full_name, email, password }) }),
  demoLogin: () =>
    withFallback(() => request<AuthResponse>("/api/auth/demo", { method: "POST" }), {
      token: `bearer_${DEMO_USER_ID}`,
      user: { id: DEMO_USER_ID, email: demoProfile.email, full_name: demoProfile.full_name },
    }),

  // ---------- Dashboard / profile ----------
  getDashboard: () => withFallback(() => request<DashboardData>(`/api/dashboard?${q({ user_id: currentUserId() })}`), demoDashboard),
  getProfile: () => withFallback(() => request<Profile>(`/api/profile?${q({ user_id: currentUserId() })}`), demoProfile),
  updateProfile: (data: Partial<Profile>) =>
    request<Profile>(`/api/profile?${q({ user_id: currentUserId() })}`, { method: "PUT", body: JSON.stringify(data) }),

  // ---------- Skills ----------
  getUserSkills: () => withFallback(() => request<UserSkillItem[]>(`/api/skills/user?${q({ user_id: currentUserId() })}`), demoUserSkills),
  getTaxonomy: () => withFallback(() => request<SkillItem[]>("/api/skills"), [] as SkillItem[]),
  addUserSkill: (skill_name: string, proficiency = "Moderate") =>
    request<UserSkillItem>(`/api/skills/user?${q({ user_id: currentUserId() })}`, {
      method: "POST",
      body: JSON.stringify({ skill_name, proficiency }),
    }),
  deleteUserSkill: (id: string) =>
    request<{ status: string }>(`/api/skills/user/${id}?${q({ user_id: currentUserId() })}`, { method: "DELETE" }),

  // ---------- Careers ----------
  getCareers: () => withFallback(() => request<CareerRole[]>("/api/careers"), demoCareers),
  recommendCareers: () =>
    withFallback(
      async () =>
        (await request<{ recommendations: CareerRecommendation[] }>(`/api/careers/recommend?${q({ user_id: currentUserId() })}`, {
          method: "POST",
        })).recommendations,
      demoRecommendations,
    ),

  // ---------- Skill gap ----------
  analyzeSkillGap: (roleId?: string) =>
    withFallback(
      () =>
        request<SkillGapAnalysis>(`/api/skill-gap/analyze?${q({ user_id: currentUserId() })}`, {
          method: "POST",
          body: JSON.stringify({ role_id: roleId }),
        }),
      demoSkillGap,
    ),

  // ---------- Roadmap ----------
  getRoadmap: () => withFallback(() => request<Roadmap>(`/api/roadmap/current?${q({ user_id: currentUserId() })}`), demoRoadmap),
  generateRoadmap: (roleId: string) =>
    withFallback(
      () => request<Roadmap>(`/api/roadmap/generate?${q({ role_id: roleId, user_id: currentUserId() })}`, { method: "POST" }),
      demoRoadmap,
    ),

  // ---------- Opportunities ----------
  getOpportunities: (type?: string) =>
    withFallback(
      () => request<Opportunity[]>(`/api/opportunities?${q({ type_filter: type === "all" ? undefined : type, user_id: currentUserId() })}`),
      type && type !== "all" ? demoOpportunities.filter((o) => o.type.toLowerCase() === type.toLowerCase()) : demoOpportunities,
    ),

  // ---------- Resume ----------
  getLatestResume: () => withFallback(() => request<ResumeAnalysis>(`/api/resume/latest?${q({ user_id: currentUserId() })}`), demoResume),
  uploadResume: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return withFallback(
      () => request<ResumeAnalysis>(`/api/resume/upload?${q({ user_id: currentUserId() })}`, { method: "POST", body: form }),
      { ...demoResume, filename: file.name },
    );
  },
};
