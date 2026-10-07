"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { animate } from "animejs";
import { AlertTriangle, CheckCircle2, CircleDashed, CircleSlash, RefreshCw, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { prefersReducedMotion } from "@/hooks/use-anime";
import type { DataSource } from "@/lib/api";
import { cn, scoreTone } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Skill chip                                                          */
/* ------------------------------------------------------------------ */
export type SkillState = "strong" | "partial" | "missing" | "neutral";

const chipStyles: Record<SkillState, string> = {
  strong: "border-success/30 bg-success/10 text-emerald-300",
  partial: "border-warning/30 bg-warning/10 text-amber-300",
  missing: "border-danger/30 bg-danger/10 text-rose-300",
  neutral: "border-primary/25 bg-primary/10 text-blue-200",
};
const chipIcon: Record<SkillState, ReactNode> = {
  strong: <CheckCircle2 className="size-3.5" aria-hidden />,
  partial: <CircleDashed className="size-3.5" aria-hidden />,
  missing: <CircleSlash className="size-3.5" aria-hidden />,
  neutral: null,
};

export function SkillChip({ name, state = "neutral", className, children }: { name: string; state?: SkillState; className?: string; children?: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", chipStyles[state], className)}>
      {chipIcon[state]}
      {name}
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Match badge                                                         */
/* ------------------------------------------------------------------ */
export function MatchBadge({ score, className }: { score: number; className?: string }) {
  const tone = scoreTone(score);
  const styles = {
    success: "bg-success/12 text-emerald-300 border-success/30",
    primary: "bg-primary/12 text-blue-200 border-primary/30",
    warning: "bg-warning/12 text-amber-300 border-warning/30",
    danger: "bg-danger/12 text-rose-300 border-danger/30",
  }[tone];
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tabular-nums", styles, className)}>
      {Math.round(score)}% Match
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Animated progress bar                                               */
/* ------------------------------------------------------------------ */
export function ProgressBar({ value, className, barClassName, label }: { value: number; className?: string; barClassName?: string; label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const v = Math.max(0, Math.min(100, value));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.style.transform = `scaleX(${v / 100})`;
      return;
    }
    el.style.transform = "scaleX(0)";
    let a: { revert: () => void } | null = null;
    const io = new IntersectionObserver(([e]) => {
      if (!e?.isIntersecting) return;
      a = animate(el, { scaleX: [0, v / 100], duration: 1200, ease: "outExpo" });
      io.disconnect();
    });
    io.observe(el);
    return () => {
      io.disconnect();
      a?.revert();
    };
  }, [v]);

  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-white/[0.06]", className)}
      role="progressbar"
      aria-valuenow={Math.round(v)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        ref={ref}
        className={cn("h-full w-full origin-left rounded-full bg-brand", barClassName)}
        style={{ transform: `scaleX(${v / 100})` }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* States: loading / empty / error                                     */
/* ------------------------------------------------------------------ */
export function PanelSkeleton({ className, lines = 3 }: { className?: string; lines?: number }) {
  return (
    <div className={cn("surface rounded-2xl p-5", className)} aria-busy="true" aria-live="polite">
      <Skeleton className="mb-4 h-4 w-1/3 bg-white/[0.06]" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="mb-2.5 h-3 bg-white/[0.05]" style={{ width: `${90 - i * 12}%` }} />
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center rounded-2xl border border-danger/25 bg-danger/5 px-6 py-10 text-center">
      <AlertTriangle className="mb-2 size-6 text-danger" aria-hidden />
      <p className="font-medium text-white">Something went wrong</p>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          <RefreshCw className="size-4" /> Try again
        </Button>
      )}
    </div>
  );
}

/** Small indicator showing that data came from the live API. */
export function DataSourceBadge({ source }: { source: DataSource | null }) {
  if (!source) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
        "border-success/30 bg-success/10 text-emerald-300",
      )}
      title="Connected to CareerBridge API"
    >
      <Wifi className="size-3" aria-hidden />
      Live data
    </span>
  );
}
