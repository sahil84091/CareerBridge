"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Briefcase,
  Search,
  MapPin,
  Building,
  ArrowRight,
  ExternalLink,
  Sparkles,
  TrendingUp,
  GraduationCap,
} from "lucide-react";
import { AppShell } from "@/components/navigation/app-shell";
import { Button } from "@/components/ui/button";
import { MatchBadge, SkillChip, PanelSkeleton, ErrorState } from "@/components/shared/primitives";
import { api } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import type { Opportunity } from "@/types";

const typeFilters = [
  { id: "all", label: "All Opportunities" },
  { id: "full-time", label: "Full-Time Roles" },
  { id: "internship", label: "Internships" },
];

export default function OpportunitiesPage() {
  const [activeType, setActiveType] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, loading, error, reload, source } = useApi<Opportunity[]>(
    () => api.getOpportunities(activeType),
    [activeType]
  );

  const allOpps = data || [];

  const filteredOpps = useMemo(() => {
    return allOpps.filter((opp) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        opp.title.toLowerCase().includes(q) ||
        opp.company.toLowerCase().includes(q) ||
        opp.location.toLowerCase().includes(q) ||
        (opp.required_skills || []).some((s) => s.toLowerCase().includes(q)) ||
        (opp.preferred_skills || []).some((s) => s.toLowerCase().includes(q));

      const matchesLocation =
        locationFilter === "all" ||
        (locationFilter === "remote" && opp.location.toLowerCase().includes("remote")) ||
        (locationFilter === "india" && opp.location.toLowerCase().includes("india")) ||
        (locationFilter === "us" && (opp.location.toLowerCase().includes("san francisco") || opp.location.toLowerCase().includes("ny") || opp.location.toLowerCase().includes("seattle") || opp.location.toLowerCase().includes("austin") || opp.location.toLowerCase().includes("us")));

      return matchesQuery && matchesLocation;
    });
  }, [allOpps, searchQuery, locationFilter]);

  const stats = useMemo(() => {
    const total = allOpps.length;
    const internships = allOpps.filter(
      (o) => (o.type || "").toLowerCase().includes("intern") || o.title.toLowerCase().includes("intern")
    ).length;
    const fullTime = allOpps.filter((o) => (o.type || "").toLowerCase().includes("full")).length;
    const topMatch = allOpps.length > 0 ? Math.max(...allOpps.map((o) => o.match_score)) : 0;
    return { total, internships, fullTime, topMatch };
  }, [allOpps]);

  return (
    <AppShell dataSource={source}>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
                <Briefcase className="size-7 text-cyan-400" />
                <span>Jobs & Internships Matcher</span>
              </h1>
              <a
                href="https://www.adzuna.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-[11px] font-semibold hover:bg-cyan-500/20 transition-all"
              >
                <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>Powered by Adzuna</span>
                <ExternalLink className="size-2.5" />
              </a>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Live job listings and internships from Adzuna algorithmically matched against your verified skills.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/skill-gap">
              <Button variant="outline" size="sm" className="rounded-xl border-white/10 hover:bg-white/5 text-xs text-slate-300">
                <Sparkles className="size-3.5 mr-1.5 text-cyan-400" />
                <span>Improve Match Scores</span>
                <ArrowRight className="size-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="surface p-4 rounded-2xl border border-white/10 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Available Roles
            </span>
            <div className="flex items-baseline justify-between">
              <p className="font-heading text-2xl font-bold text-white">{stats.total}</p>
              <Briefcase className="size-4 text-cyan-400" />
            </div>
            <p className="text-[10px] text-muted-foreground">Scored against your profile</p>
          </div>

          <div className="surface p-4 rounded-2xl border border-white/10 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Top Match Score
            </span>
            <div className="flex items-baseline justify-between">
              <p className="font-heading text-2xl font-bold text-emerald-400">{stats.topMatch}%</p>
              <TrendingUp className="size-4 text-emerald-400" />
            </div>
            <p className="text-[10px] text-muted-foreground">Highest alignment</p>
          </div>

          <div className="surface p-4 rounded-2xl border border-white/10 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Internships
            </span>
            <div className="flex items-baseline justify-between">
              <p className="font-heading text-2xl font-bold text-purple-400">{stats.internships}</p>
              <GraduationCap className="size-4 text-purple-400" />
            </div>
            <p className="text-[10px] text-muted-foreground">Student & entry pathways</p>
          </div>

          <div className="surface p-4 rounded-2xl border border-white/10 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Full-Time Jobs
            </span>
            <div className="flex items-baseline justify-between">
              <p className="font-heading text-2xl font-bold text-sky-400">{stats.fullTime}</p>
              <Building className="size-4 text-sky-400" />
            </div>
            <p className="text-[10px] text-muted-foreground">Permanent opportunities</p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="surface p-4 rounded-2xl border border-white/10 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Type buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {typeFilters.map((tf) => (
                <button
                  key={tf.id}
                  type="button"
                  onClick={() => setActiveType(tf.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    activeType === tf.id
                      ? "border-primary bg-primary/20 text-white shadow-sm ring-1 ring-primary/40"
                      : "border-white/10 bg-white/[0.03] text-muted-foreground hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            {/* Location selector & search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="h-10 rounded-xl border border-white/10 bg-card px-3 text-xs font-medium text-white focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="all" className="bg-[#090D1E] text-white">All Locations</option>
                <option value="remote" className="bg-[#090D1E] text-white">Remote Only</option>
                <option value="india" className="bg-[#090D1E] text-white">India (Bengaluru / Pune / Hyd)</option>
                <option value="us" className="bg-[#090D1E] text-white">US / Global Tech Hubs</option>
              </select>

              <div className="relative min-w-[220px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter by title, company, skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Opportunities List */}
        {loading ? (
          <div className="space-y-4">
            <PanelSkeleton lines={4} />
            <PanelSkeleton lines={4} />
            <PanelSkeleton lines={4} />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : (
          <div className="space-y-4">
            {filteredOpps.map((opp) => {
              return (
                <div
                  key={opp.id}
                  className="surface p-6 rounded-2xl border border-white/10 hover:border-primary/40 transition-all shadow-lg space-y-4"
                >
                  {/* Top line: Role title, company, salary, match badge */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-heading text-lg font-bold text-white">
                          {opp.title}
                        </h3>
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                            opp.type.toLowerCase().includes("intern")
                              ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                              : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                          }`}
                        >
                          {opp.type}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-1.5">
                        <span className="flex items-center gap-1 text-slate-200 font-medium">
                          <Building className="size-3.5 text-primary" />
                          <span>{opp.company}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3.5 text-slate-400" />
                          <span>{opp.location}</span>
                        </span>
                        {opp.salary_range && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-semibold text-[11px]">
                            <span>💰 {opp.salary_range}</span>
                          </span>
                        )}
                        <span>{opp.experience_level}</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-3">
                      <MatchBadge score={opp.match_score} />
                    </div>
                  </div>

                  {/* Description snippet */}
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {opp.description}
                  </p>

                  {/* Skills Matched vs Missing */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/[0.06] text-xs">
                    <div>
                      <span className="text-[11px] font-semibold text-emerald-400 block mb-1.5">
                        Matched Skills:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {opp.matched_skills.map((s) => (
                          <SkillChip key={s} name={s} state="strong" />
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-rose-400 block mb-1.5">
                        Missing Requirements:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {opp.missing_skills.map((s) => (
                          <SkillChip key={s} name={s} state="missing" />
                        ))}
                        {opp.missing_skills.length === 0 && (
                          <span className="text-muted-foreground italic text-xs">
                            None! Full match.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-cyan-400">
                        {opp.source || "Adzuna"}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Closing {opp.missing_skills.slice(0, 2).join(", ")} will increase your match score.
                      </span>
                    </div>
                    {(() => {
                      const adzunaTargetUrl =
                        opp.apply_url && opp.apply_url.startsWith("http")
                          ? opp.apply_url
                          : `https://www.adzuna.in/search?q=${encodeURIComponent(opp.title)}&w=${encodeURIComponent(opp.location || "India")}`;
                      return (
                        <a
                          href={adzunaTargetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="gradient" size="sm" className="rounded-xl text-xs font-semibold px-5 shadow-md shadow-blue-500/20 cursor-pointer">
                            <span>Apply via Adzuna</span>
                            <ExternalLink className="size-3.5 ml-1.5" />
                          </Button>
                        </a>
                      );
                    })()}
                  </div>

                </div>
              );
            })}

            {filteredOpps.length === 0 && (
              <div className="text-center py-12 surface rounded-2xl border border-white/10 text-muted-foreground text-sm">
                No matching opportunities found for this filter.
              </div>
            )}

            {/* Official Adzuna Attribution Box */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground text-center sm:text-left">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-400" />
                <span>Job and internship search data feeds provided by <strong>Adzuna</strong>.</span>
              </div>
              <a
                href="https://www.adzuna.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1"
              >
                <span>Visit Adzuna India</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
