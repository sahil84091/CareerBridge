"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  UploadCloud,
  ChevronRight,
} from "lucide-react";
import { AppShell } from "@/components/navigation/app-shell";
import { Button } from "@/components/ui/button";
import { ReadinessRing } from "@/components/shared/readiness-ring";
import { ProgressBar, PanelSkeleton, ErrorState } from "@/components/shared/primitives";
import { api } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import { useSession } from "@/lib/session";
import type { DashboardData, Opportunity, Roadmap } from "@/types";

export default function DashboardPage() {
  const session = useSession();
  const { data, loading, error, reload, source } = useApi<DashboardData>(() => api.getDashboard());
  const { data: roadmap } = useApi<Roadmap>(() => api.getRoadmap());
  const { data: opportunities } = useApi<Opportunity[]>(() => api.getOpportunities("all"));

  const displayName = session?.full_name || data?.profile?.full_name || "there";
  const firstName = displayName.split(" ")[0];

  return (
    <AppShell dataSource={source}>
      {loading ? (
        <div className="space-y-6">
          <PanelSkeleton lines={3} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <PanelSkeleton lines={4} />
            <PanelSkeleton lines={4} />
            <PanelSkeleton lines={4} />
            <PanelSkeleton lines={4} />
          </div>
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : data ? (
        <div className="space-y-8">
          
          {/* Welcome Headline (Matching Mockup) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
                <span>Welcome back, {firstName}!</span>
                <span className="text-xl">👋</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Here&apos;s your career journey overview.
              </p>
            </div>
            <Link href="/resume">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex rounded-xl border-white/10 hover:bg-white/5 text-xs text-slate-300">
                <UploadCloud className="size-3.5 mr-1.5 text-primary" />
                <span>Upload New Resume</span>
              </Button>
            </Link>
          </div>

          {/* Top 4 Metric Cards (Matching Mockup) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Card 1: Career Readiness Ring */}
            <div className="surface p-5 rounded-2xl border border-white/10 flex flex-col justify-between shadow-lg">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Career Readiness
              </span>
              <div className="my-3 flex justify-center">
                <ReadinessRing value={data.readiness_score} size={135} stroke={10} label="Ready" />
              </div>
              <p className="text-center text-xs font-medium text-emerald-400 flex items-center justify-center gap-1">
                <CheckCircle2 className="size-3.5" />
                <span>{data.readiness_score}% role readiness</span>
              </p>
            </div>

            {/* Card 2: Target Role */}
            <div className="surface p-5 rounded-2xl border border-white/10 flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Target Role
                </span>
                <Link href="/career-explorer">
                  <span className="text-[11px] font-semibold text-primary hover:underline cursor-pointer">
                    Change
                  </span>
                </Link>
              </div>
              <div className="my-2">
                <h3 className="font-heading text-lg font-bold text-white">
                  {data.target_role?.title || data.profile?.target_role_title || "Choose a target role"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {data.target_role?.category || "Choose a career path"}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {(data.target_role?.required_skills ?? []).slice(0, 3).map((skill) => (
                  <span key={skill.skill_name} className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-[11px] text-slate-300">{skill.skill_name}</span>
                ))}
              </div>
            </div>

            {/* Card 3: Top Skill Gaps */}
            <div className="surface p-5 rounded-2xl border border-white/10 flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Top Skill Gaps
                </span>
                <Link href="/skill-gap">
                  <span className="text-[11px] font-semibold text-primary hover:underline cursor-pointer">
                    View
                  </span>
                </Link>
              </div>
              <ul className="my-2 space-y-2">
                {(data.top_skill_gaps || []).slice(0, 5).map((skill, idx) => {
                  const colors = ["bg-rose-400", "bg-rose-400", "bg-amber-400", "bg-amber-400", "bg-blue-400"];
                  return (
                    <li key={skill} className="flex items-center gap-2 text-xs text-slate-200">
                      <span className={`size-2 rounded-full ${colors[idx % colors.length]}`} />
                      <span className="font-medium">{skill}</span>
                    </li>
                  );
                })}
                {!data.top_skill_gaps?.length && <li className="text-xs text-muted-foreground">Run a skill-gap analysis to see priorities.</li>}
              </ul>
              <Link href="/skill-gap" className="text-[11px] text-muted-foreground hover:text-white flex items-center gap-1">
                <span>Analyze all required skills</span>
                <ChevronRight className="size-3" />
              </Link>
            </div>

            {/* Card 4: Total Opportunities */}
            <div className="surface p-5 rounded-2xl border border-white/10 flex flex-col justify-between shadow-lg">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Opportunities
              </span>
              <div className="my-2 flex items-baseline justify-between">
                <div>
                  <div className="font-heading text-4xl font-bold text-white tracking-tight">
                    {opportunities?.length ?? "—"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Matching jobs & internships
                  </p>
                </div>
                <Link href="/opportunities">
                  <div className="size-10 rounded-full bg-primary/20 hover:bg-primary/30 border border-primary/40 flex items-center justify-center text-primary hover:text-white transition-all cursor-pointer">
                    <ArrowRight className="size-4" />
                  </div>
                </Link>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                <span>Matched to your recorded skills</span>
                <span className="text-emerald-400 font-semibold">{opportunities?.length ?? 0} roles</span>
              </div>
            </div>

          </div>

          {/* Bottom Grid: Your Roadmap + Recommended Opportunities (Matching Mockup) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 7 Columns: Your Roadmap */}
            <div className="lg:col-span-7 surface p-6 rounded-2xl border border-white/10 shadow-lg space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-base font-bold text-white">Your Roadmap</h3>
                  <p className="text-xs text-muted-foreground">{roadmap?.phases.length ?? 0} learning phases</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-white">{roadmap?.current_progress ?? data.roadmap_progress}%</span>
                  <Link href="/roadmap">
                    <span className="text-xs font-semibold text-primary hover:underline">
                      View Full Roadmap →
                    </span>
                  </Link>
                </div>
              </div>

              {/* Progress bar */}
              <ProgressBar value={roadmap?.current_progress ?? data.roadmap_progress} className="h-2" />

              {/* Milestone list matching mockup */}
              <div className="space-y-3 pt-2">
                {(roadmap?.phases ?? []).slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`size-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        item.status === "completed"
                          ? "bg-primary text-white"
                          : item.status === "in_progress"
                          ? "bg-primary/20 text-primary border border-primary/40 ring-2 ring-primary/20"
                          : "bg-white/10 text-muted-foreground"
                      }`}>
                        {item.phase_number}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">{item.title}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {item.skills.length} skills • {item.milestone_projects.length} projects
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 capitalize px-2 py-0.5 rounded-md bg-white/[0.04]">
                      {item.status === "completed" ? "Completed" : item.status === "in_progress" ? "In Progress" : "Upcoming"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-right">
                <Link href="/roadmap" className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1">
                  <span>View Full Roadmap</span>
                  <ChevronRight className="size-3.5" />
                </Link>
              </div>
            </div>

            {/* Right 5 Columns: Recommended Opportunities */}
            <div className="lg:col-span-5 surface p-6 rounded-2xl border border-white/10 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-base font-bold text-white">Recommended Opportunities</h3>
                <Link href="/opportunities">
                  <span className="text-xs font-semibold text-primary hover:underline">
                    View All
                  </span>
                </Link>
              </div>

              {/* Live opportunities scored against your skills */}
              <div className="space-y-3">
                {(opportunities ?? []).slice(0, 3).map((opp) => (
                  <div
                    key={opp.id}
                    className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-primary/30 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-9 rounded-xl bg-primary/20 flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-md">
                        {opp.company.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{opp.title}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {opp.company} • {opp.location}
                        </p>
                        {opp.salary_range && (
                          <p className="text-[10px] font-semibold text-emerald-400 mt-0.5 truncate">
                            {opp.salary_range}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                      {opp.match_score}% Match
                    </span>
                  </div>
                ))}
                {!opportunities?.length && <p className="rounded-xl border border-white/10 p-4 text-xs text-muted-foreground">No live opportunities loaded. Check provider configuration or open the opportunities page to retry.</p>}
              </div>

              <div className="pt-2">
                <Link href="/opportunities">
                  <Button variant="outline" size="sm" className="w-full rounded-xl text-xs border-white/10 hover:bg-white/5 text-slate-300">
                    <span>Browse matched opportunities</span>
                    <ArrowRight className="size-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>

          </div>

        </div>
      ) : null}
    </AppShell>
  );
}
