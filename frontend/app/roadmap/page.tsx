"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Route,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  FolderGit2,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { AppShell } from "@/components/navigation/app-shell";
import { Button } from "@/components/ui/button";
import { ProgressBar, PanelSkeleton, ErrorState } from "@/components/shared/primitives";
import { api } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import type { Roadmap, RoadmapPhase } from "@/types";

export default function RoadmapPage() {
  const { data, loading, error, reload, setData, source } = useApi<Roadmap>(() => api.getRoadmap());
  const [expandedPhase, setExpandedPhase] = useState<number | null>(2);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const activePhase = data?.phases.find((phase) => phase.status === "in_progress");
  const nextPhase = data?.phases.find((phase) => phase.status === "pending");
  const progressLabel = activePhase
    ? `Phase ${activePhase.phase_number} of ${data?.phases.length} In Progress`
    : nextPhase
      ? `Phase ${nextPhase.phase_number} of ${data?.phases.length} Ready to Start`
      : "All roadmap phases completed";

  const toggleGoal = async (phase: RoadmapPhase, goal: string) => {
    if (!phase.id || saving) return;
    setSaving(true);
    setActionError(null);
    const completed = new Set(phase.completed_goals ?? []);
    if (completed.has(goal)) completed.delete(goal);
    else completed.add(goal);
    try {
      const updated = await api.updateRoadmapItem(phase.id, { completed_goals: [...completed] });
      setData(() => updated);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not save roadmap progress.");
    } finally {
      setSaving(false);
    }
  };

  const regenerate = async () => {
    setSaving(true);
    setActionError(null);
    try {
      const updated = await api.generateRoadmap(data?.role_id);
      setData(() => updated.data);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not regenerate roadmap.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell dataSource={source}>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
              <Route className="size-7 text-primary" />
              <span>Personalized Career Roadmap</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Phased action plan tailored to bridge your specific skill gaps for{" "}
              <span className="text-white font-semibold">{data?.role_title || "your selected role"}</span>.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Calendar className="size-3.5 text-primary" />
              <span>Target: {data?.target_duration || "Not set"}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={regenerate}
              disabled={saving}
              className="rounded-xl border-white/10 hover:bg-white/5 text-xs text-slate-300"
            >
              <Sparkles className="size-3.5 mr-1.5 text-cyan-400" />
              <span>Regenerate Roadmap</span>
            </Button>
          </div>
        </div>

        {/* Loading / Error States */}
        {actionError && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{actionError}</p>}
        {loading ? (
          <div className="space-y-6">
            <PanelSkeleton lines={3} />
            <PanelSkeleton lines={5} />
            <PanelSkeleton lines={5} />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : data ? (
          <div className="space-y-8">
            
            {/* Top Roadmap Progress Banner */}
            <div className="surface p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    Overall Curriculum Progress
                  </span>
                  <h3 className="font-heading text-xl sm:text-2xl font-bold text-white mt-1">
                    {progressLabel}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="font-heading text-3xl font-bold text-white">
                    {Math.round(data.current_progress)}%
                  </span>
                  <p className="text-[11px] text-muted-foreground">Milestones Achieved</p>
                </div>
              </div>

              <ProgressBar value={data.current_progress} className="h-3" />
            </div>

            {/* Phased Timeline List */}
            <div className="space-y-4">
              {(data.phases || []).map((phase) => {
                const isExpanded = expandedPhase === phase.phase_number;
                const isDone = phase.status === "completed";
                const isCurrent = phase.status === "in_progress";

                return (
                  <div
                    key={phase.phase_number}
                    className={`surface rounded-2xl border transition-all overflow-hidden ${
                      isCurrent
                        ? "border-primary/50 ring-1 ring-primary/30 shadow-lg"
                        : isDone
                        ? "border-emerald-500/30"
                        : "border-white/10"
                    }`}
                  >
                    {/* Phase Header Collapsible Toggle */}
                    <div
                      onClick={() => setExpandedPhase(isExpanded ? null : phase.phase_number)}
                      className="p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Number Badge */}
                        <div
                          className={`size-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                            isDone
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              : isCurrent
                              ? "bg-primary text-white shadow-md shadow-primary/30"
                              : "bg-white/5 text-muted-foreground border border-white/10"
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="size-5" /> : `0${phase.phase_number}`}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              {phase.phase_name}
                            </span>
                            <span
                              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                isDone
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                  : isCurrent
                                  ? "bg-primary/10 text-primary border border-primary/30"
                                  : "bg-white/5 text-muted-foreground"
                              }`}
                            >
                              {isDone ? "Completed" : isCurrent ? "In Progress" : "Pending"}
                            </span>
                          </div>
                          <h4 className="font-heading text-base sm:text-lg font-bold text-white mt-0.5 truncate">
                            {phase.title}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          {phase.skills.length} skills • {phase.milestone_projects.length} project
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="size-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="size-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Content Body */}
                    {isExpanded && (
                      <div className="px-5 pb-6 sm:px-6 pt-2 border-t border-white/[0.06] space-y-5 bg-black/20">
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          {phase.description}
                        </p>

                        {/* Skills Covered in this Phase */}
                        <div>
                          <span className="text-xs font-semibold text-slate-400 block mb-2">
                            Competencies Targeted:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {phase.skills.map((skill) => (
                              <span
                                key={skill}
                                className="px-3 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-200 font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Milestone Projects */}
                        {phase.milestone_projects?.length > 0 && (
                          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-1.5">
                            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                              <FolderGit2 className="size-4" />
                              <span>Recommended Capstone Milestone:</span>
                            </div>
                            <p className="text-xs sm:text-sm text-white font-medium">
                              {phase.milestone_projects[0]}
                            </p>
                          </div>
                        )}

                        {/* Learning Goals Checklists */}
                        {phase.learning_goals?.length > 0 && (
                          <div className="space-y-2 pt-1">
                            <span className="text-xs font-semibold text-slate-400 block">
                              Action Items & Objectives:
                            </span>
                            <div className="space-y-2">
                              {phase.learning_goals.map((goal) => {
                                const checked = (phase.completed_goals ?? []).includes(goal);
                                return (
                                  <label
                                    key={goal}
                                    onClick={() => void toggleGoal(phase, goal)}
                                    className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] cursor-pointer transition-all"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      readOnly
                                      className="rounded border-white/20 bg-white/5 text-primary size-4"
                                    />
                                    <span
                                      className={`text-xs text-slate-200 ${
                                        checked ? "line-through opacity-60" : ""
                                      }`}
                                    >
                                      {goal}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}

                      </div>
                    )}

                  </div>
                );
              })}
            </div>

            {/* Bottom CTA to Opportunities */}
            <div className="surface p-6 rounded-2xl border border-white/10 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-heading text-base font-bold text-white">
                  Ready to test your skills in the market?
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  See internships and junior developer roles aligned with your current phase.
                </p>
              </div>
              <Link href="/opportunities">
                <Button variant="gradient" size="sm" className="rounded-xl text-xs font-semibold">
                  <span>Browse Matched Opportunities</span>
                  <ArrowRight className="size-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>

          </div>
        ) : null}

      </div>
    </AppShell>
  );
}
