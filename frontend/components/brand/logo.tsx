import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** CareerBridge icon mark (the "C" bridge emblem). */
export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/logo-mark.png"
      alt=""
      aria-hidden="true"
      width={512}
      height={512}
      priority
      className={cn("size-8 object-contain", className)}
    />
  );
}

/**
 * Full CareerBridge AI logo with name and tagline.
 * The source image has a transparent background so it can sit on any surface.
 */
export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center rounded-xl px-1.5 py-1 shadow-sm ring-1 ring-white/10 focus-visible:outline-2",
        className
      )}
      aria-label="CareerBridge AI home"
    >
      <Image
        src="/brand/logo-full.png"
        alt="CareerBridge AI — Bridging the gap between skills and career opportunities"
        width={1072}
        height={1055}
        priority
        className="h-14 w-auto object-contain"
      />
    </Link>
  );
}
