"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Search,
  MapPin,
  Building,
  DollarSign,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  CircleSlash,
  Filter,
} from "lucide-react";
import { AppShell } from "@/components/navigation/app-shell";
import { Button } from "@/components/ui/button";
import { MatchBadge, SkillChip, PanelSkeleton, ErrorState } from "@/components/shared/primitives";
import { api } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import type { Opportunity } from "@/types";

const typeFilters = [
  { id: "all", label: "All Opportunities" },
  { id: "full-time", label: "Full-Time" },
  { id: "internship", label: "Internships" },
];

export default function OpportunitiesPage() {
  const [activeType, setActiveType] = useState("all");
  const { data, loading, error, reload, source } = useApi<Opportunity[]>(
    () => api.getOpportunities(activeType),
    [activeType]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedRoles, setAppliedRoles] = useState<Record<string, boolean>>({});

  const handleApply = (oppId: string) => {
    setAppliedRoles((prev) => ({ ...prev, [oppId]: true }));
  };

  const filteredOpps = (data || []).filter((opp) => {
    const q = searchQuery.toLowerCase();
    return (
      opp.title.toLowerCase().includes(q) ||
      opp.company.toLowerCase().includes(q) ||
      opp.location.toLowerCase().includes(q)
    );
  });

  return (
    <AppShell dataSource={source}>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
              <Briefcase className="size-7 text-cyan-400" />
              <span>Jobs & Internships</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Curated roles matched against your current competencies with match percentages.
            </p>
          </div>
          <Link href="/skill-gap">
            <Button variant="outline" size="sm" className="rounded-xl border-white/10 hover:bg-white/5 text-xs text-slate-300">
              <span>Improve Match Scores</span>
              <ArrowRight className="size-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {typeFilters.map((tf) => (
              <button
                key={tf.id}
                type="button"
                onClick={() => setActiveType(tf.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                  activeType === tf.id
                    ? "border-primary bg-primary/20 text-white shadow-sm ring-1 ring-primary/40"
                    : "border-white/10 bg-white/[0.03] text-muted-foreground hover:bg-white/5 hover:text-white"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter by company or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
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
              const applied = !!appliedRoles[opp.id];
              return (
                <div
                  key={opp.id}
                  className="surface p-6 rounded-2xl border border-white/10 hover:border-primary/40 transition-all shadow-lg space-y-4"
                >
                  {/* Top line: Role title, company, salary, match badge */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading text-lg font-bold text-white">
                          {opp.title}
                        </h3>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white/[0.05] text-slate-300">
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
                          <span className="text-emerald-400 font-medium">
                            {opp.salary_range}
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
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                      Closing {opp.missing_skills.slice(0, 2).join(", ")} will increase your ranking score.
                    </span>
                    <Button
                      variant={applied ? "outline" : "gradient"}
                      size="sm"
                      onClick={() => handleApply(opp.id)}
                      className="rounded-xl text-xs font-semibold px-5"
                    >
                      {applied ? (
                        <>
                          <CheckCircle2 className="size-3.5 mr-1 text-emerald-400" />
                          <span>Application Sent</span>
                        </>
                      ) : (
                        <>
                          <span>Apply with CareerBridge Profile</span>
                          <ExternalLink className="size-3.5 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>

                </div>
              );
            })}

            {filteredOpps.length === 0 && (
              <div className="text-center py-12 surface rounded-2xl border border-white/10 text-muted-foreground text-sm">
                No matching opportunities found for this filter.
              </div>
            )}
          </div>
        )}

      </div>
    </AppShell>
  );
}
