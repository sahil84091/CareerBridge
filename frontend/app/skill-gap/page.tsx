"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart2,
  CheckCircle2,
  CircleDashed,
  CircleSlash,
  ArrowRight,
  Sparkles,
  Layers,
  TrendingUp,
  AlertTriangle,
  Compass,
} from "lucide-react";
import { AppShell } from "@/components/navigation/app-shell";
import { Button } from "@/components/ui/button";
import { ReadinessRing } from "@/components/shared/readiness-ring";
import { SkillChip, PanelSkeleton, ErrorState } from "@/components/shared/primitives";
import { api } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import { demoCareers, skillDemand } from "@/lib/demo-data";
import type { SkillGapAnalysis, CareerRole } from "@/types";

export default function SkillGapPage() {
  const [selectedRoleId, setSelectedRoleId] = useState("role_fullstack");
  const { data, loading, error, reload, source } = useApi<SkillGapAnalysis>(
    () => api.analyzeSkillGap(selectedRoleId),
    [selectedRoleId]
  );
  const { data: careers } = useApi<CareerRole[]>(() => api.getCareers());

  const activeCareers = careers || demoCareers;

  return (
    <AppShell dataSource={source}>
      <div className="space-y-8">
        
        {/* Header & Target Role Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
              <BarChart2 className="size-7 text-violet-400" />
              <span>Skill Gap Analysis</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              AI comparison of your verified skills against industry job requirements.
            </p>
          </div>

          {/* Role switcher dropdown */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-muted-foreground">Target Role:</span>
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="h-10 rounded-xl border border-white/10 bg-card/80 px-3 text-xs font-medium text-white focus:outline-none focus:border-primary cursor-pointer shadow-md"
            >
              {activeCareers.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#090D1E] text-white">
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div className="space-y-6">
            <PanelSkeleton lines={3} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <PanelSkeleton lines={4} />
              <PanelSkeleton lines={4} />
              <PanelSkeleton lines={4} />
            </div>
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : data ? (
          <div className="space-y-8">
            
            {/* Top Readiness Score Summary Card */}
            <div className="surface p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                
                <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                  <ReadinessRing value={data.readiness_score || 72} size={150} stroke={12} label="Readiness" />
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold">
                      <Sparkles className="size-3 text-cyan-400" />
                      <span>{data.role_title} Benchmark</span>
                    </div>
                    <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white">
                      {Math.round(data.readiness_score)}% Career Readiness
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
                      You meet {data.matched_count || data.matched_skills.length} of {data.total_required || 12} core requirements. Closing the top missing gaps will elevate your profile to 85%+ readiness.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  <Link href="/roadmap" className="w-full sm:w-auto">
                    <Button variant="gradient" size="lg" className="w-full sm:w-auto rounded-xl px-6 text-sm font-semibold shadow-lg shadow-blue-500/25">
                      <span>View Personalized Roadmap</span>
                      <ArrowRight className="size-4 ml-2" />
                    </Button>
                  </Link>
                </div>

              </div>
            </div>

            {/* 3-Column Categorical Breakdown (Strong, Partial, Missing) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Column 1: Strong / Matched Skills */}
              <div className="surface p-6 rounded-2xl border border-white/10 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4.5 text-emerald-400" />
                    <h3 className="font-heading text-base font-bold text-white">
                      Matched Skills
                    </h3>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {data.matched_skills.length}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Verified competencies that align directly with industry criteria.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {data.matched_skills.map((s) => (
                    <SkillChip key={s.name} name={s.name} state="strong" />
                  ))}
                  {data.matched_skills.length === 0 && (
                    <span className="text-xs text-muted-foreground italic">None detected yet</span>
                  )}
                </div>
              </div>

              {/* Column 2: Partial / Needs Improvement */}
              <div className="surface p-6 rounded-2xl border border-white/10 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CircleDashed className="size-4.5 text-amber-400" />
                    <h3 className="font-heading text-base font-bold text-white">
                      Needs Improvement
                    </h3>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    {data.partial_skills.length}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Familiar technologies that need deeper hands-on project depth.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {data.partial_skills.map((s) => (
                    <SkillChip key={s.name} name={s.name} state="partial" />
                  ))}
                  {data.partial_skills.length === 0 && (
                    <span className="text-xs text-muted-foreground italic">None detected</span>
                  )}
                </div>
              </div>

              {/* Column 3: Missing / Critical Gaps */}
              <div className="surface p-6 rounded-2xl border border-white/10 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CircleSlash className="size-4.5 text-rose-400" />
                    <h3 className="font-heading text-base font-bold text-white">
                      Missing Skills
                    </h3>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                    {data.missing_skills.length}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  High-impact skills not yet identified in your current profile.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {data.missing_skills.map((s) => (
                    <SkillChip key={s.name} name={s.name} state="missing" />
                  ))}
                  {data.missing_skills.length === 0 && (
                    <span className="text-xs text-muted-foreground italic">No gaps detected!</span>
                  )}
                </div>
              </div>

            </div>

            {/* High-Impact Priority Roadmap Table */}
            <div className="surface p-6 rounded-2xl border border-white/10 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-base font-bold text-white">
                    Priority Skill Recommendations
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Skills sorted by their frequency and weight in current hiring pipelines.
                  </p>
                </div>
                <Link href="/roadmap">
                  <Button variant="outline" size="sm" className="rounded-xl text-xs border-white/10 text-slate-300">
                    <span>Generate Learning Plan</span>
                    <ArrowRight className="size-3.5 ml-1" />
                  </Button>
                </Link>
              </div>

              <div className="divide-y divide-white/[0.06] pt-2">
                {(data.priority_skills || ["REST API", "Node.js", "React", "Docker", "AWS"]).map((skill, idx) => {
                  const demand = skillDemand[skill] || 75;
                  return (
                    <div key={skill} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-muted-foreground font-mono">
                          0{idx + 1}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-white">{skill}</p>
                          <span className="text-[11px] text-muted-foreground">
                            In {demand}% of {data.role_title} openings
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:block text-right">
                          <span className="text-xs font-semibold text-cyan-400">High Impact</span>
                          <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden mt-1">
                            <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${demand}%` }} />
                          </div>
                        </div>
                        <Link href="/roadmap">
                          <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-white">
                            Learn
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        ) : null}

      </div>
    </AppShell>
  );
}
