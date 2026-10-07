"use client";

import { useEffect, useRef, type RefObject } from "react";
import { animate, createScope, onScroll, stagger, type Scope } from "animejs";

/** True when the user asked the OS to minimise motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Scroll-reveal for every `[data-reveal]` element inside the returned ref.
 *
 *  - `data-reveal="up" | "left" | "right" | "scale" | "fade"` sets the entrance.
 *  - `data-reveal-delay="120"` adds a delay in ms.
 *  - `[data-stagger]` containers reveal their direct children in sequence.
 *
 * Uses IntersectionObserver to trigger once (cheap, no scroll listeners) and
 * anime.js for the motion. All instances live in an anime.js scope that is
 * reverted on unmount (official React integration pattern).
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(deps: unknown[] = []): RefObject<T | null> {
  const root = useRef<T | null>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const reveals = Array.from(el.querySelectorAll<HTMLElement>("[data-reveal]"));
    const groups = Array.from(el.querySelectorAll<HTMLElement>("[data-stagger]"));

    if (prefersReducedMotion()) {
      reveals.forEach((n) => (n.style.opacity = "1"));
      groups.forEach((g) => Array.from(g.children).forEach((c) => ((c as HTMLElement).style.opacity = "1")));
      return;
    }

    // Hide stagger children up-front (they are not [data-reveal] themselves).
    groups.forEach((g) => Array.from(g.children).forEach((c) => ((c as HTMLElement).style.opacity = "0")));

    let scope: Scope | null = null;
    scope = createScope({ root }).add(() => {});

    const play = (target: HTMLElement) => {
      scope?.add(() => {
        if (target.hasAttribute("data-stagger")) {
          animate(Array.from(target.children) as HTMLElement[], {
            opacity: [0, 1],
            y: [28, 0],
            duration: 750,
            delay: stagger(90, { start: Number(target.dataset.revealDelay ?? 0) }),
            ease: "outExpo",
          });
          return;
        }
        const kind = target.dataset.reveal || "up";
        const from: Record<string, [number, number]> = {
          up: [32, 0],
          left: [-40, 0],
          right: [40, 0],
        };
        animate(target, {
          opacity: [0, 1],
          ...(kind === "up" ? { y: from.up } : {}),
          ...(kind === "left" || kind === "right" ? { x: from[kind] } : {}),
          ...(kind === "scale" ? { scale: [0.94, 1] } : {}),
          duration: 850,
          delay: Number(target.dataset.revealDelay ?? 0),
          ease: "outExpo",
        });
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            play(entry.target as HTMLElement);
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    [...reveals, ...groups].forEach((n) => io.observe(n));

    return () => {
      io.disconnect();
      scope?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return root;
}

/**
 * Scroll-scrubbed parallax: every `[data-parallax="<px>"]` element inside the
 * ref translates on Y while its parent section crosses the viewport.
 * Built on anime.js `onScroll` with smoothed sync. Intensity halves on mobile.
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>(): RefObject<T | null> {
  const root = useRef<T | null>(null);

  useEffect(() => {
    if (!root.current || prefersReducedMotion()) return;
    const mobile = window.innerWidth < 768;

    const scope = createScope({ root }).add(() => {
      root.current?.querySelectorAll<HTMLElement>("[data-parallax]").forEach((node) => {
        const distance = Number(node.dataset.parallax ?? 80) * (mobile ? 0.5 : 1);
        animate(node, {
          y: [0, distance],
          ease: "linear",
          autoplay: onScroll({
            target: node.parentElement ?? node,
            enter: "bottom top",
            leave: "top bottom",
            sync: 0.25,
          }),
        });
      });
    });

    return () => scope.revert();
  }, []);

  return root;
}

/** Count a number up from 0 when the element first scrolls into view. */
export function useCountUp<T extends HTMLElement = HTMLSpanElement>(
  value: number,
  { duration = 1400, decimals = 0, suffix = "" }: { duration?: number; decimals?: number; suffix?: string } = {},
): RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const format = (n: number) => `${n.toFixed(decimals)}${suffix}`;
    if (prefersReducedMotion()) {
      el.textContent = format(value);
      return;
    }
    el.textContent = format(0);
    const counter = { v: 0 };
    let anim: ReturnType<typeof animate> | null = null;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        anim = animate(counter, {
          v: value,
          duration,
          ease: "outExpo",
          onUpdate: () => {
            el.textContent = format(counter.v);
          },
        });
        io.disconnect();
      },
      { threshold: 0.3 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      anim?.revert();
    };
  }, [value, duration, decimals, suffix]);

  return ref;
}
