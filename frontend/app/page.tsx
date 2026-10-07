"use client";

import Link from "next/link";
import type { PointerEvent } from "react";
import {
  ArrowRight,
  ArrowDown,
  Compass,
  BarChart2,
  BookOpen,
  Briefcase,
  Lightbulb,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Users,
  FileText,
  ChevronRight,
  Zap,
} from "lucide-react";
import { SiteHeader } from "@/components/navigation/site-header";
import { Button } from "@/components/ui/button";
import { ReadinessRing } from "@/components/shared/readiness-ring";
import { SkillChip } from "@/components/shared/primitives";
import { prefersReducedMotion, useScrollReveal } from "@/hooks/use-anime";

export default function LandingPage() {
  const scrollRef = useScrollReveal();

  const handleDashboardPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch" || prefersReducedMotion()) return;

    const panel = event.currentTarget;
    const bounds = panel.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    const rotateX = (0.5 - y) * 3.2;
    const rotateY = (x - 0.5) * 4 - 0.75;

    panel.style.transform = `perspective(1600px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(3px)`;
    panel.style.setProperty("--pointer-x", `${(x * 100).toFixed(1)}%`);
    panel.style.setProperty("--pointer-y", `${(y * 100).toFixed(1)}%`);
  };

  const handleDashboardPointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.transform = "perspective(1600px) rotateY(-1.25deg) rotateX(0.4deg)";
  };

  return (
    <div ref={scrollRef} className="min-h-screen bg-[#060818] text-foreground overflow-x-hidden selection:bg-primary/30">
      <SiteHeader />

      {/* ----------------- HERO SECTION ----------------- */}
      <section className="relative isolate flex min-h-[calc(100svh-7rem)] flex-col justify-center overflow-hidden pb-32 pt-28 sm:pt-32 lg:pb-32 lg:pt-32">
        {/* Ambient atmospheric glows */}
        <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_58%_34%,rgba(13,69,155,0.34),transparent_58%),linear-gradient(180deg,#06152c_0%,#061127_66%,#050d20_100%)]" />
        <div className="pointer-events-none absolute -right-40 top-20 -z-10 size-[520px] rounded-full bg-blue-500/10 blur-[140px]" />

        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.03fr_0.97fr] lg:gap-7">
            
            {/* Left Column: Headlines & CTAs */}
            <div className="relative z-10 space-y-6 text-center lg:text-left" data-reveal="up">
              {/* Badge */}
              <div className="inline-flex items-center gap-3 rounded-full border border-blue-400/40 bg-[#081a37]/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-100 shadow-[0_0_28px_rgba(36,120,255,0.16)]">
                <span className="size-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.9)]" aria-hidden="true" />
                <span>From your skills to your next move</span>
              </div>

              {/* Headline */}
              <h1 className="font-heading mx-auto max-w-[700px] text-4xl font-bold leading-[1.04] tracking-tight text-white sm:text-6xl lg:mx-0 lg:text-[clamp(2.25rem,3.55vw,3.375rem)]">
                Your skills are the bridge to <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">what’s next.</span>
              </h1>

              {/* Subhead */}
              <p className="mx-auto max-w-xl text-base leading-relaxed text-blue-100/75 sm:text-lg lg:mx-0">
                CareerBridge maps the strengths you already have to a focused learning plan—and the roles that plan can open.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col items-center justify-center gap-4 pt-1 sm:flex-row lg:justify-start">
                <Link
                  href="/dashboard"
                  className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-violet-600 px-7 text-base font-semibold text-white shadow-[0_0_34px_rgba(43,125,255,0.45)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_0_44px_rgba(77,106,255,0.58)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060818] sm:w-auto"
                >
                  <span>Build my career path</span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>

                <a
                  href="#features"
                  className="inline-flex min-h-14 items-center gap-2 rounded-xl px-3 text-base font-medium text-blue-100/80 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060818]"
                >
                  <span>Explore the platform</span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              </div>

              {/* Value highlights */}
              <div className="hidden gap-3 border-t border-white/10 pt-6 text-left sm:grid-cols-3 sm:gap-4 lg:grid" data-stagger>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-blue-400/20 bg-blue-400/[0.08] text-blue-300"><Sparkles className="size-4" aria-hidden="true" /></span>
                  <span>Personalized insights</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-violet-400/20 bg-violet-400/[0.08] text-violet-300"><BookOpen className="size-4" aria-hidden="true" /></span>
                  <span>Learning paths for your goals</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-cyan-400/20 bg-cyan-400/[0.08] text-cyan-300"><Briefcase className="size-4" aria-hidden="true" /></span>
                  <span>Real opportunities</span>
                </div>
              </div>
            </div>

            {/* Interactive career readiness preview */}
            <div className="group relative mx-auto w-full max-w-[760px] [perspective:1600px]" data-reveal="scale">
              <div
                onPointerMove={handleDashboardPointerMove}
                onPointerLeave={handleDashboardPointerLeave}
                className="relative overflow-hidden rounded-[1.65rem] border border-blue-300/35 bg-[linear-gradient(145deg,rgba(14,39,82,0.97),rgba(7,19,47,0.98))] p-4 shadow-[0_24px_64px_-32px_rgba(22,110,255,0.42),0_0_32px_rgba(37,99,235,0.10)_inset] transition-transform duration-300 ease-out [transform:rotateY(-1.25deg)_rotateX(0.4deg)] sm:p-6"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200 to-transparent shadow-[0_0_10px_1px_rgba(34,211,238,0.35)]" />
                <div className="pointer-events-none absolute -right-24 -top-28 size-72 rounded-full bg-blue-500/[0.04] blur-2xl" />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-300 [background:radial-gradient(circle_at_var(--pointer-x,50%)_var(--pointer-y,50%),rgba(103,190,255,0.09),transparent_34%)] group-hover:opacity-100"
                />
                <div className="relative grid gap-3 sm:grid-cols-[0.82fr_1.18fr]">
                  <div className="rounded-2xl border border-blue-200/15 bg-[linear-gradient(155deg,rgba(25,65,125,0.5),rgba(8,24,57,0.64))] p-4 shadow-[0_18px_35px_-24px_rgba(72,165,255,0.55)] sm:p-5">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-sm font-semibold text-white">Career Readiness</h2>
                      <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-[10px] font-semibold text-cyan-200">Example</span>
                    </div>
                    <div className="my-2 flex justify-center sm:my-3">
                      <ReadinessRing value={72} size={152} stroke={10} label="Ready" />
                    </div>
                    <p className="text-center text-xs leading-relaxed text-blue-100/75">Keep building core skills to unlock more opportunities.</p>
                  </div>

                  <div className="grid gap-3">
                    <div className="rounded-2xl border border-blue-200/15 bg-[linear-gradient(145deg,rgba(25,65,125,0.42),rgba(8,24,57,0.58))] p-4 shadow-[0_18px_35px_-24px_rgba(72,165,255,0.4)] sm:p-5">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-white">Key strengths</h3>
                        <span className="text-xs text-blue-200/55">Your skills, at a glance</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: "Problem solving", Icon: Sparkles, style: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100" },
                          { label: "Communication", Icon: MessageCircle, style: "border-violet-300/20 bg-violet-400/10 text-violet-100" },
                          { label: "Data analysis", Icon: BarChart2, style: "border-teal-300/20 bg-teal-400/10 text-teal-100" },
                          { label: "Creativity", Icon: Lightbulb, style: "border-blue-300/20 bg-blue-400/10 text-blue-100" },
                          { label: "Adaptability", Icon: Users, style: "border-purple-300/20 bg-purple-400/10 text-purple-100" },
                        ].map(({ label, Icon, style }) => (
                          <span key={label} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-medium ${style}`}>
                            <Icon className="size-3.5" aria-hidden="true" />{label}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-blue-200/15 bg-[linear-gradient(145deg,rgba(25,65,125,0.38),rgba(8,24,57,0.6))] p-4 sm:p-5">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-white">Your career path</h3>
                        <Link href="/roadmap" className="inline-flex items-center gap-1 text-xs text-blue-300 transition-colors hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">View full plan <ArrowRight className="size-3.5" aria-hidden="true" /></Link>
                      </div>
                      <div className="relative grid grid-cols-3 gap-1">
                        <div className="pointer-events-none absolute left-[16%] right-[16%] top-6 h-[2px] bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 shadow-[0_0_12px_rgba(34,211,238,0.7)]" aria-hidden="true" />
                        {[
                          { title: "Discover", description: "Explore your interests and see what fits", href: "/skill-gap", Icon: Compass, tone: "text-cyan-200" },
                          { title: "Build", description: "Learn in-demand skills with a personal plan", href: "/roadmap", Icon: BookOpen, tone: "text-blue-200" },
                          { title: "Grow", description: "Find roles and keep advancing", href: "/opportunities", Icon: TrendingUp, tone: "text-violet-200" },
                        ].map(({ title, description, href, Icon, tone }) => (
                          <Link key={title} href={href} aria-label={`${title}: ${description}`} className="group relative z-10 flex min-w-0 flex-col items-center rounded-xl px-1.5 pb-1 pt-1 text-center transition-colors hover:bg-white/[0.035] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
                            <span className={`grid size-11 place-items-center rounded-full border border-current bg-[#0a1c42] shadow-[0_0_20px_rgba(48,117,255,0.3)] transition duration-300 group-hover:scale-110 group-hover:shadow-[0_0_28px_rgba(34,211,238,0.55)] ${tone}`}>
                              <Icon className="size-5" aria-hidden="true" />
                            </span>
                            <span className="mt-2 text-xs font-semibold text-white">{title}</span>
                            <span className="mt-1 max-w-[130px] text-[10px] leading-snug text-blue-100/65">{description}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Quiet visual path into the next section */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-72 overflow-hidden" aria-hidden="true">
          <svg viewBox="0 0 1440 300" preserveAspectRatio="none" className="h-full w-full opacity-90">
            <defs>
              <linearGradient id="hero-path-gradient" x1="0" x2="1">
                <stop offset="0%" stopColor="#1b46a6" stopOpacity="0.02" />
                <stop offset="38%" stopColor="#08bdf2" stopOpacity="0.88" />
                <stop offset="70%" stopColor="#507bff" stopOpacity="0.92" />
                <stop offset="100%" stopColor="#a58aff" stopOpacity="0.16" />
              </linearGradient>
              <filter id="hero-path-glow" x="-30%" y="-100%" width="160%" height="300%">
                <feGaussianBlur stdDeviation="7" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <path d="M660 30 C900 28 1000 170 1220 182 C1400 194 1375 233 1180 244 C930 258 796 166 586 190 C370 216 180 264 0 282" fill="none" stroke="url(#hero-path-gradient)" strokeWidth="3" filter="url(#hero-path-glow)" />
            <path d="M660 30 C900 28 1000 170 1220 182 C1400 194 1375 233 1180 244 C930 258 796 166 586 190 C370 216 180 264 0 282" fill="none" stroke="url(#hero-path-gradient)" strokeWidth="1.2" />
            <circle cx="780" cy="195" r="5" fill="#60dfff" />
            <circle cx="1060" cy="229" r="6" fill="#7db7ff" />
            <circle cx="520" cy="199" r="5" fill="#4dbbff" />
          </svg>
        </div>
        <a
          href="#features"
          className="absolute bottom-16 left-1/2 z-10 inline-flex -translate-x-1/2 flex-col items-center gap-2 rounded-lg px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-blue-100/75 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
        >
          <span>Scroll to explore</span>
          <span className="grid size-6 place-items-center rounded-full border border-blue-200/50"><ArrowDown className="size-3" aria-hidden="true" /></span>
        </a>
      </section>

      {/* ----------------- FEATURES SECTION ("Why CareerBridge AI?") ----------------- */}
      <section id="features" className="scroll-mt-24 relative border-y border-white/[0.06] bg-[#090D1E]/60 pb-24 pt-8">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-3xl text-center" data-reveal="up">
            <span className="mx-auto mb-4 block h-[2px] w-14 rounded-full bg-gradient-to-r from-cyan-300 to-blue-500" />
            <h2 className="font-heading text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
              <span className="text-gradient">A clearer path</span> from skills to opportunity
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-300/80 sm:text-lg">
              Personalized guidance, real skills, and meaningful next steps — all in one place.
            </p>
          </div>

          {/* Product capabilities */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" data-stagger>
              {/* Feature 1 */}
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 shadow-lg transition-all duration-300 hover:border-primary/40 hover:bg-white/[0.06] group">
                <div className="size-12 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-4">
                  <Compass className="size-6 text-blue-400" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-white mb-2">
                  AI Career Guidance
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Discover the best career paths based on your profile, market trends, and learning aspirations.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 shadow-lg transition-all duration-300 hover:border-violet-500/40 hover:bg-white/[0.06] group">
                <div className="size-12 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform mb-4">
                  <BarChart2 className="size-6 text-violet-400" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-white mb-2">
                  Skill Gap Analysis
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Identify missing and partial skills with AI-powered insights mapped directly against industry role benchmarks.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 shadow-lg transition-all duration-300 hover:border-emerald-500/40 hover:bg-white/[0.06] group">
                <div className="size-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform mb-4">
                  <BookOpen className="size-6 text-emerald-400" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-white mb-2">
                  Personalized Roadmaps
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Get a step-by-step phased learning plan with targeted milestones, capstone projects, and goal tracking.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 shadow-lg transition-all duration-300 hover:border-cyan-500/40 hover:bg-white/[0.06] group">
                <div className="size-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform mb-4">
                  <Briefcase className="size-6 text-cyan-400" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-white mb-2">
                  Job & Internship Matching
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Find top-tier opportunities that match your verified skill set and target career trajectory with precision scores.
                </p>
              </div>

          </div>
        </div>
      </section>

      {/* ----------------- INTERACTIVE PRODUCT FLOW / PREVIEW ----------------- */}
      <section id="how-it-works" className="scroll-mt-24 py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16" data-reveal="up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-xs font-semibold text-primary mb-3">
              <Zap className="size-3.5" />
              <span>How It Works</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-5xl font-bold text-white tracking-tight">
              From Resume to Dream Role in 5 Steps
            </h2>
            <p className="text-muted-foreground mt-3 text-base">
              Our autonomous intelligence pipeline bridges the gap between where you are today and where the industry wants you to be.
            </p>
          </div>

          {/* Stepper Timeline Visual */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative mb-16" data-stagger>
            {[
              { step: "01", title: "Upload Resume", desc: "PDF or DOCX parsed with NLP into structured competencies." },
              { step: "02", title: "Extract Skills", desc: "Normalized against 200+ industry taxonomy standards." },
              { step: "03", title: "Target Career", desc: "Compare against real-world role requirements & salary baselines." },
              { step: "04", title: "Detect Gaps", desc: "Readiness score computed with priority missing skills." },
              { step: "05", title: "Get Hired", desc: "Phased milestone roadmap + opportunity matchmaking." },
            ].map((s) => (
              <div key={s.step} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-primary/40 transition-all group">
                <span className="text-2xl font-bold font-heading text-gradient">{s.step}</span>
                <h3 className="text-base font-semibold text-white mt-2 mb-1 group-hover:text-primary transition-colors">
                  {s.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Live Interactive Preview Card */}
          <div className="rounded-3xl p-6 sm:p-10 surface border border-white/10 shadow-2xl relative overflow-hidden" data-reveal="scale">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              
              <div className="space-y-4 max-w-md">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="size-3.5" />
                  <span>Live Readiness Engine</span>
                </div>
                <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white">
                  Full Stack Developer Benchmark
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Compare your current skills with the requirements of your target role and see what to build next.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <SkillChip name="JavaScript" state="strong" />
                  <SkillChip name="React" state="partial" />
                  <SkillChip name="Node.js" state="partial" />
                  <SkillChip name="Docker" state="missing" />
                  <SkillChip name="AWS" state="missing" />
                </div>
                <div className="pt-2">
                  <Link href="/skill-gap">
                    <Button variant="default" size="sm" className="rounded-xl">
                      <span>View Full Breakdown</span>
                      <ChevronRight className="size-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Gauge & Stats widget */}
              <div className="flex flex-col sm:flex-row items-center gap-8 p-6 rounded-2xl bg-black/40 border border-white/10 shadow-inner">
                <ReadinessRing value={72} size={150} label="Readiness" />
                <div className="space-y-3 text-left">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Skill Breakdown</div>
                  <div className="flex items-center gap-3">
                    <span className="size-2.5 rounded-full bg-emerald-400" />
                    <span className="text-sm text-slate-200">Matched Skills:</span>
                    <span className="text-sm font-bold text-white ml-auto">12</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="size-2.5 rounded-full bg-amber-400" />
                    <span className="text-sm text-slate-200">Partial Skills:</span>
                    <span className="text-sm font-bold text-white ml-auto">4</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="size-2.5 rounded-full bg-rose-400" />
                    <span className="text-sm text-slate-200">Missing Gaps:</span>
                    <span className="text-sm font-bold text-white ml-auto">5</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ----------------- FINAL CALL TO ACTION ----------------- */}
      <section className="py-24 relative overflow-hidden text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10" data-reveal="up">
          <div className="p-10 sm:p-14 rounded-3xl surface border border-primary/30 shadow-[0_0_80px_rgba(79,124,255,0.15)] space-y-6">
            <h2 className="font-heading text-3xl sm:text-5xl font-bold text-white">
              Ready to Accelerate Your Career?
            </h2>
            <p className="text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Upload your resume in seconds, uncover high-impact skill gaps, and get a personalized path to your dream engineering role.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link href="/dashboard">
                <Button variant="gradient" size="lg" className="rounded-xl px-8 text-base shadow-xl shadow-blue-500/30">
                  <span>Open Your Career Dashboard</span>
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              </Link>
              <Link href="/resume">
                <Button variant="outline" size="lg" className="rounded-xl px-6 border-white/20 text-white">
                  <FileText className="size-4 mr-2" />
                  <span>Upload Resume Now</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- FOOTER ----------------- */}
      <footer className="border-t border-white/[0.08] py-12 text-sm text-slate-400 bg-[#040612]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="font-heading font-semibold text-white">CareerBridge AI</span>
            <span>•</span>
            <span className="text-xs text-muted-foreground">© {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/skill-gap" className="hover:text-white transition-colors">Skill Gap</Link>
            <Link href="/roadmap" className="hover:text-white transition-colors">Roadmap</Link>
            <Link href="/opportunities" className="hover:text-white transition-colors">Opportunities</Link>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
