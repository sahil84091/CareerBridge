import Link from "next/link";
import { cn } from "@/lib/utils";

/** CareerBridge mark: a bridge arc rising into an orbit, in the brand gradient. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("size-8", className)} aria-hidden="true" fill="none">
      <defs>
        <linearGradient id="cb-g" x1="4" y1="34" x2="36" y2="6" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="0.55" stopColor="#6366F1" />
          <stop offset="1" stopColor="#A78BFA" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="url(#cb-g)" opacity="0.14" />
      <path d="M8 27c3.5-9 8-13.5 12-13.5S28.5 18 32 27" stroke="url(#cb-g)" strokeWidth="3" strokeLinecap="round" />
      <path d="M13 27v-4.5M20 27v-7M27 27v-4.5" stroke="url(#cb-g)" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="31" cy="10" r="3" fill="#22D3EE" />
    </svg>
  );
}

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-2", className)} aria-label="CareerBridge AI home">
      <LogoMark />
      <span className="font-heading text-[17px] font-semibold tracking-tight text-white">
        CareerBridge <span className="text-gradient">AI</span>
      </span>
    </Link>
  );
}
