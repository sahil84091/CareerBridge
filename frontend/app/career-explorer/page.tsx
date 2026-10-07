"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Compass,
  Search,
  Check,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Layers,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/navigation/app-shell";
import { Button } from "@/components/ui/button";
import { MatchBadge, SkillChip, PanelSkeleton, ErrorState } from "@/components/shared/primitives";
import { api } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import type { CareerRole, Profile } from "@/types";

const categories = ["All", "Software Engineering", "Data & AI", "Infrastructure", "Design", "Product"];

export default function CareerExplorerPage() {
  const { data: careers, loading, error, reload, source } = useApi<CareerRole[]>(() => api.getCareers());
  const { data: profile, reload: reloadProfile } = useApi<Profile>(() => api.getProfile());
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [settingRole, setSettingRole] = useState<string | null>(null);

  const currentTargetId = profile?.target_role_id || "role_fullstack";

  const filteredRoles = (careers || []).filter((role) => {
    const matchesCat = selectedCategory === "All" || role.category === selectedCategory;
    const matchesQuery =
      role.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.required_skills.some((s) => s.skill_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  const handleSetTargetRole = async (role: CareerRole) => {
    setSettingRole(role.id);
    try {
      await api.updateProfile({
        target_role_id: role.id,
        target_role_title: role.title,
      });
      reloadProfile();
    } catch (e) {
      // Mock update
    } finally {
      setSettingRole(null);
    }
  };

  return (
    <AppShell dataSource={source}>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
              <Compass className="size-7 text-primary" />
              <span>Career Path Explorer</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Explore industry benchmark roles, analyze requirements, and select your career target.
            </p>
          </div>
          <Link href="/skill-gap">
            <Button variant="outline" size="sm" className="rounded-xl border-white/10 hover:bg-white/5 text-xs text-slate-300">
              <span>View Current Gap Analysis</span>
              <ArrowRight className="size-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "border-primary bg-primary/20 text-white shadow-sm ring-1 ring-primary/40"
                    : "border-white/10 bg-white/[0.03] text-muted-foreground hover:bg-white/5 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search roles or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Roles Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PanelSkeleton lines={5} />
            <PanelSkeleton lines={5} />
            <PanelSkeleton lines={5} />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoles.map((role) => {
              const isTarget = currentTargetId === role.id;
              // Mock candidate match score for demo realism
              const matchEstimate = isTarget ? 72 : role.category === "Software Engineering" ? 78 : 55;

              return (
                <div
                  key={role.id}
                  className={`surface p-6 rounded-2xl border transition-all flex flex-col justify-between shadow-lg ${
                    isTarget
                      ? "border-primary/60 ring-1 ring-primary/30 shadow-[0_0_25px_rgba(79,124,255,0.15)]"
                      : "border-white/10 hover:border-primary/40"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top Row: Category + Match Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                        {role.category}
                      </span>
                      <MatchBadge score={matchEstimate} />
                    </div>

                    {/* Role Title & Description */}
                    <div>
                      <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                        <span>{role.title}</span>
                        {isTarget && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                            Current Target
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-3">
                        {role.description}
                      </p>
                    </div>

                    {/* Salary & Demand Meta */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06] text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Avg. Salary</span>
                        <span className="font-semibold text-white">{role.average_salary || "$110k - $150k"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Market Demand</span>
                        <span className="font-semibold text-emerald-400 flex items-center gap-1">
                          <TrendingUp className="size-3" />
                          <span>{role.market_demand || "High"}</span>
                        </span>
                      </div>
                    </div>

                    {/* Key Required Skills */}
                    <div className="pt-2">
                      <span className="text-[11px] font-medium text-slate-400 block mb-1.5">
                        Core Competencies ({role.required_skills.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {role.required_skills.slice(0, 5).map((rs) => (
                          <span
                            key={rs.skill_name}
                            className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-[11px] text-slate-300"
                          >
                            {rs.skill_name}
                          </span>
                        ))}
                        {role.required_skills.length > 5 && (
                          <span className="text-[10px] text-muted-foreground self-center">
                            +{role.required_skills.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bottom */}
                  <div className="pt-6 mt-4 border-t border-white/[0.06] flex items-center gap-2">
                    {isTarget ? (
                      <Link href="/skill-gap" className="w-full">
                        <Button variant="default" size="sm" className="w-full rounded-xl text-xs font-semibold">
                          <span>View Skill Gap</span>
                          <ArrowRight className="size-3.5 ml-1" />
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetTargetRole(role)}
                        disabled={settingRole === role.id}
                        className="w-full rounded-xl text-xs border-white/10 hover:bg-white/5 text-slate-300 hover:text-white"
                      >
                        <Sparkles className="size-3.5 mr-1 text-cyan-400" />
                        <span>{settingRole === role.id ? "Setting..." : "Set as Target Role"}</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </AppShell>
  );
}
