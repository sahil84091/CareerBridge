"use client";

import React from "react";

interface ReadinessGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export default function ReadinessGauge({
  score,
  size = 140,
  strokeWidth = 10,
}: ReadinessGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(Math.max(score, 0), 100);
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let colorGradient = "url(#gaugeGradientBlue)";
  let statusText = "Advancing";
  let statusColor = "text-blue-400";

  if (clampedScore >= 80) {
    colorGradient = "url(#gaugeGradientEmerald)";
    statusText = "Job-Ready";
    statusColor = "text-emerald-400";
  } else if (clampedScore >= 50) {
    colorGradient = "url(#gaugeGradientBlue)";
    statusText = "On Track";
    statusColor = "text-blue-400";
  } else {
    colorGradient = "url(#gaugeGradientPurple)";
    statusText = "Developing";
    statusColor = "text-amber-400";
  }

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="gaugeGradientBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="gaugeGradientEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <linearGradient id="gaugeGradientPurple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>

        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Value */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colorGradient}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-black text-white tracking-tight">
          {clampedScore}%
        </span>
        <span className={`text-[10px] font-semibold uppercase tracking-wider ${statusColor}`}>
          {statusText}
        </span>
      </div>
    </div>
  );
}
