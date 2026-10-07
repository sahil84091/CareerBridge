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
  Award,
  ShieldCheck,
  ShieldAlert,
  Video,
  ExternalLink,
  Calendar,
  BookOpen,
} from "lucide-react";
import { AppShell } from "@/components/navigation/app-shell";
import { Button } from "@/components/ui/button";
import { ReadinessRing } from "@/components/shared/readiness-ring";
import { SkillChip, PanelSkeleton, ErrorState } from "@/components/shared/primitives";
import { api } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import type { SkillGapAnalysis, CareerRole, Profile } from "@/types";

export default function SkillGapPage() {
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const { data: careers } = useApi<CareerRole[]>(() => api.getCareers());
  const { data: profile } = useApi<Profile>(() => api.getProfile());
  const activeRoleId = careers?.some((role) => role.id === selectedRoleId)
    ? selectedRoleId
    : profile?.target_role_id || "";
  const { data, loading, error, reload, source } = useApi<SkillGapAnalysis>(
    () => api.analyzeSkillGap(activeRoleId || undefined),
    [activeRoleId]
  );
  const activeCareers = careers ?? [];

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
              value={activeRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="h-10 rounded-xl border border-white/10 bg-card/80 px-3 text-xs font-medium text-white focus:outline-none focus:border-primary cursor-pointer shadow-md"
            >
              {!activeRoleId && <option value="">Choose a career role</option>}
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
                  <ReadinessRing value={data.readiness_score} size={150} stroke={12} label="Readiness" />
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold">
                      <Sparkles className="size-3 text-cyan-400" />
                      <span>{data.role_title} Benchmark</span>
                    </div>
                    <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white">
                      {Math.round(data.readiness_score)}% Career Readiness
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
                      You meet {data.matched_count} of {data.total_required} core requirements. Use the prioritized skills below to plan your next learning steps.
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
                  Skills that align directly with this role&apos;s requirements.
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
                {(data.priority_skills || []).map((skill, idx) => {
                  const skillDetails = [...data.missing_skills, ...data.partial_skills].find((entry) => entry.name === skill);
                  return (
                    <div key={skill} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-muted-foreground font-mono">
                          0{idx + 1}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-white">{skill}</p>
                          <span className="text-[11px] text-muted-foreground">
                            {skillDetails?.importance ?? "Recommended"} priority · weight {skillDetails?.weight ?? "—"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:block text-right">
                          <span className="text-xs font-semibold text-cyan-400">{skillDetails?.importance ?? "Priority"}</span>
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

            {/* Verified Credentials & Readiness Impact */}
            {data.certifications_summary && data.certifications_summary.length > 0 && (
              <div className="surface p-6 rounded-2xl border border-white/10 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="size-5 text-amber-400" />
                    <div>
                      <h3 className="font-heading text-base font-bold text-white">
                        Verified Credentials & Credibility Score
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        High-tier certifications from accredited tech authorities provide quantitative readiness bonuses.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
                    {data.certifications_summary.length} Evaluated
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {data.certifications_summary.map((cert, cIdx) => {
                    const score = cert.credibility_score ?? 70;
                    const isHigh = score >= 85;
                    const isMed = score >= 60 && score < 85;

                    return (
                      <div
                        key={cIdx}
                        className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                          isHigh
                            ? "bg-emerald-950/20 border-emerald-500/30"
                            : isMed
                            ? "bg-sky-950/20 border-sky-500/30"
                            : "bg-zinc-900/40 border-white/10"
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {isHigh ? (
                                <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
                              ) : isMed ? (
                                <CheckCircle2 className="size-4 text-sky-400 shrink-0" />
                              ) : (
                                <ShieldAlert className="size-4 text-amber-400 shrink-0" />
                              )}
                              <h4 className="text-sm font-semibold text-white">{cert.name}</h4>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                                isHigh
                                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                  : isMed
                                  ? "bg-sky-500/15 text-sky-300 border-sky-500/30"
                                  : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                              }`}
                            >
                              {score}/100 · {cert.priority_level}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Issuer: <span className="text-slate-200 font-medium">{cert.issuer || "Independent"}</span>
                          </p>
                          {cert.reputation_notes && (
                            <p className="text-[11px] text-slate-300 leading-relaxed bg-black/20 p-2 rounded-lg border border-white/5">
                              {cert.reputation_notes}
                            </p>
                          )}
                        </div>

                        {cert.skills_validated && cert.skills_validated.length > 0 && (
                          <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                              Validated:
                            </span>
                            {cert.skills_validated.map((s) => (
                              <span
                                key={s}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-cyan-300"
                              >
                                ✓ {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Curated Video Masterclasses & Tutorials */}
            {data.curated_resources && data.curated_resources.length > 0 && (
              <div className="surface p-6 rounded-2xl border border-white/10 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="size-5 text-rose-400" />
                    <div>
                      <h3 className="font-heading text-base font-bold text-white">
                        Curated Video Masterclasses & Tutorials
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        High-yield video courses mapped directly to your critical missing & partial skills.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
                    {data.curated_resources.length} Handpicked Videos
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                  {data.curated_resources.map((res, rIdx) => (
                    <a
                      key={rIdx}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 flex flex-col justify-between group transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span className="text-rose-400 font-semibold">{res.platform}</span>
                          {res.duration && <span className="font-mono text-[10px]">{res.duration}</span>}
                        </div>
                        <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-primary transition-colors line-clamp-2">
                          {res.title}
                        </h4>
                        {res.description && (
                          <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                            {res.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 flex items-center justify-between text-[11px]">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-cyan-300 font-medium text-[10px]">
                          Target: {res.skill}
                        </span>
                        <span className="inline-flex items-center gap-1 text-primary group-hover:text-white font-medium text-xs">
                          <span>Watch</span>
                          <ExternalLink className="size-3" />
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Structured Sprint Learning Plan */}
            {data.structured_plan && data.structured_plan.length > 0 && (
              <div className="surface p-6 rounded-2xl border border-white/10 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-5 text-violet-400" />
                    <div>
                      <h3 className="font-heading text-base font-bold text-white">
                        Structured Sprint Learning Plan
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Chronological sprint progression tailored to close your skill gaps for {data.role_title}.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  {data.structured_plan.map((step) => (
                    <div
                      key={step.step_number}
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col md:flex-row md:items-start justify-between gap-4"
                    >
                      <div className="space-y-2 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="size-6 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                            {step.step_number}
                          </span>
                          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                            {step.phase_name}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            • {step.estimated_weeks}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white">{step.title}</h4>
                        <ul className="space-y-1 pt-1">
                          {step.action_items.map((action, aIdx) => (
                            <li key={aIdx} className="text-xs text-slate-300 flex items-start gap-2">
                              <span className="text-primary mt-0.5">•</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {step.recommended_video && (
                        <div className="md:w-72 shrink-0 p-3 rounded-lg bg-black/25 border border-white/10 space-y-2">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span className="text-rose-400 font-semibold flex items-center gap-1">
                              <Video className="size-3" />
                              Recommended Tutorial
                            </span>
                            {step.recommended_video.duration && <span>{step.recommended_video.duration}</span>}
                          </div>
                          <p className="text-xs font-medium text-white line-clamp-2">
                            {step.recommended_video.title}
                          </p>
                          <a
                            href={step.recommended_video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-white transition-colors"
                          >
                            <span>Open on YouTube</span>
                            <ExternalLink className="size-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        ) : null}

      </div>
    </AppShell>
  );
}
