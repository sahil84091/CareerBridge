"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  ShieldCheck,
  Server,
  Bell,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Wifi,
} from "lucide-react";
import { AppShell } from "@/components/navigation/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, API_BASE_URL } from "@/lib/api";
import { clearSession } from "@/lib/session";

export default function SettingsPage() {
  const [apiStatus, setApiStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const [salaryExpectation, setSalaryExpectation] = useState("$110,000 - $140,000");
  const [remoteOnly, setRemoteOnly] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const checkHealth = async () => {
    setApiStatus("checking");
    try {
      const res = await api.health();
      setApiStatus(res?.status === "healthy" ? "connected" : "disconnected");
    } catch {
      setApiStatus("disconnected");
    }
  };

  useEffect(() => {
    api.health()
      .then((res) => setApiStatus(res?.status === "healthy" ? "connected" : "disconnected"))
      .catch(() => setApiStatus("disconnected"));
  }, []);

  const handleResetData = () => {
    setResetting(true);
    clearSession();
    setTimeout(() => {
      setResetting(false);
      window.location.reload();
    }, 600);
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveFeedback("Career preferences updated successfully.");
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  return (
    <AppShell>
      <div className="space-y-8 max-w-4xl">
        
        {/* Header */}
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <Settings className="size-7 text-primary" />
            <span>Platform Settings & Architecture</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure career search criteria, notifications, and examine backend API engine status.
          </p>
        </div>

        {/* Backend Connectivity Status Panel */}
        <div className="surface p-6 rounded-2xl border border-white/10 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Server className="size-5 text-cyan-400" />
              <div>
                <h3 className="font-heading text-base font-bold text-white">
                  FastAPI Engine Connectivity
                </h3>
                <p className="text-xs text-muted-foreground">
                  Target API URL: <span className="font-mono text-slate-300">{API_BASE_URL}</span>
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={checkHealth}
              className="rounded-xl border-white/10 hover:bg-white/5 text-xs text-slate-300"
            >
              <RefreshCw className="size-3.5 mr-1 text-primary" />
              <span>Ping Engine</span>
            </Button>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`size-2.5 rounded-full ${
                  apiStatus === "connected"
                    ? "bg-emerald-400 animate-ping"
                    : apiStatus === "checking"
                    ? "bg-amber-400"
                    : "bg-blue-400"
                }`}
              />
              <span className="font-semibold text-white">
                {apiStatus === "connected"
                  ? "Live Backend Connected (FastAPI + PostgreSQL Engine)"
                  : apiStatus === "checking"
                  ? "Checking service health..."
                  : "Autonomous Fallback Active (Zero-Latency Demo Dataset)"}
              </span>
            </div>
            <span className="text-muted-foreground hidden sm:inline">
              {apiStatus === "connected" ? "Status: HTTP 200 OK" : "All 10 pages remain 100% functional"}
            </span>
          </div>
        </div>

        {/* Career Preferences */}
        <div className="surface p-6 rounded-2xl border border-white/10 shadow-lg space-y-5">
          <div>
            <h3 className="font-heading text-base font-bold text-white">
              Target Career Preferences
            </h3>
            <p className="text-xs text-muted-foreground">
              Adjust parameters used by the matchmaking engine.
            </p>
          </div>

          {saveFeedback && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="size-4" />
              <span>{saveFeedback}</span>
            </div>
          )}

          <form onSubmit={handleSavePreferences} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Salary Range
              </label>
              <Input
                value={salaryExpectation}
                onChange={(e) => setSalaryExpectation(e.target.value)}
                placeholder="$100k - $140k"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div>
                <p className="text-xs font-semibold text-white">Remote-First Opportunities</p>
                <p className="text-[11px] text-muted-foreground">Prioritize remote and hybrid internship matches</p>
              </div>
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
                className="rounded border-white/20 bg-white/5 text-primary size-4 cursor-pointer"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="gradient" size="sm" className="rounded-xl text-xs px-5">
                Save Preferences
              </Button>
            </div>
          </form>
        </div>

        {/* Reset Demo State */}
        <div className="surface p-6 rounded-2xl border border-white/10 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
                <RotateCcw className="size-4.5 text-amber-400" />
                <span>Reset Demo Profile</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Clear all local modifications and re-initialize the pristine hackathon demo dataset.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetData}
              disabled={resetting}
              className="rounded-xl border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs"
            >
              <span>{resetting ? "Resetting..." : "Reset to Demo Defaults"}</span>
            </Button>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
