"use client";

import { useEffect, useId, useRef } from "react";
import { animate } from "animejs";
import { prefersReducedMotion } from "@/hooks/use-anime";
import { cn } from "@/lib/utils";

interface ReadinessRingProps {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  className?: string;
}

/**
 * Circular readiness gauge. The arc and number are animated together by anime.js
 * (stroke-dashoffset + counter) the first time the ring scrolls into view.
 */
export function ReadinessRing({ value, size = 168, stroke = 12, label = "Ready", className }: ReadinessRingProps) {
  const gid = useId().replace(/:/g, "");
  const arcRef = useRef<SVGCircleElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  const target = c * (1 - clamped / 100);

  useEffect(() => {
    const arc = arcRef.current;
    const num = numRef.current;
    const wrap = wrapRef.current;
    if (!arc || !num || !wrap) return;

    if (prefersReducedMotion()) {
      arc.style.strokeDashoffset = String(target);
      num.textContent = String(Math.round(clamped));
      return;
    }

    arc.style.strokeDashoffset = String(c);
    num.textContent = "0";
    const counter = { v: 0 };
    const anims: { revert: () => void }[] = [];

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        anims.push(animate(arc, { strokeDashoffset: [c, target], duration: 1600, ease: "outExpo" }));
        anims.push(
          animate(counter, {
            v: clamped,
            duration: 1600,
            ease: "outExpo",
            onUpdate: () => {
              num.textContent = String(Math.round(counter.v));
            },
          }),
        );
        io.disconnect();
      },
      { threshold: 0.4 },
    );
    io.observe(wrap);
    return () => {
      io.disconnect();
      anims.forEach((a) => a.revert());
    };
  }, [c, target, clamped]);

  return (
    <div
      ref={wrapRef}
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${Math.round(clamped)} percent career readiness`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <defs>
          <linearGradient id={`ring-${gid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="50%" stopColor="#4F7CFF" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(148,163,255,0.1)" strokeWidth={stroke} fill="none" />
        <circle
          ref={arcRef}
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#ring-${gid})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={target}
          style={{ filter: "drop-shadow(0 0 4px rgba(79,124,255,0.24))" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-heading text-4xl font-semibold leading-none text-white" style={{ fontSize: size * 0.22 }}>
            <span ref={numRef}>{Math.round(clamped)}</span>
            <span className="text-[0.55em] text-muted-foreground">%</span>
          </div>
          <div className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
        </div>
      </div>
    </div>
  );
}
