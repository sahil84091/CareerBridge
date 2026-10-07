import React from "react";

interface SkillBadgeProps {
  name: string;
  category?: string;
  proficiency?: "Strong" | "Moderate" | "Familiar" | "Missing" | string;
  importance?: "Core" | "Important" | "Bonus" | string;
  onRemove?: () => void;
}

export default function SkillBadge({
  name,
  category,
  proficiency = "Moderate",
  importance,
  onRemove,
}: SkillBadgeProps) {
  let styleClasses = "bg-blue-500/10 text-blue-300 border-blue-500/30";
  let dotColor = "bg-blue-400";

  switch (proficiency?.toLowerCase()) {
    case "strong":
      styleClasses = "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
      dotColor = "bg-emerald-400";
      break;
    case "moderate":
      styleClasses = "bg-sky-500/10 text-sky-300 border-sky-500/30";
      dotColor = "bg-sky-400";
      break;
    case "familiar":
      styleClasses = "bg-amber-500/10 text-amber-300 border-amber-500/30";
      dotColor = "bg-amber-400";
      break;
    case "missing":
      styleClasses = "bg-rose-500/10 text-rose-300 border-rose-500/30";
      dotColor = "bg-rose-400";
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${styleClasses} transition-all`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{name}</span>
      {importance && (
        <span className="text-[10px] opacity-75 font-normal">
          ({importance})
        </span>
      )}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:text-white text-slate-400 focus:outline-none"
        >
          ×
        </button>
      )}
    </span>
  );
}
