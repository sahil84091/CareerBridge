"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Play,
  Compass,
  BarChart2,
  BookOpen,
  Briefcase,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  FileText,
  ChevronRight,
  ShieldCheck,
  Star,
  Layers,
  Zap,
} from "lucide-react";
import { SiteHeader } from "@/components/navigation/site-header";
import { Button } from "@/components/ui/button";
import { ReadinessRing } from "@/components/shared/readiness-ring";
import { SkillChip } from "@/components/shared/primitives";
import { useScrollReveal, useCountUp } from "@/hooks/use-anime";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"student" | "recruiter">("student");
  const scrollRef = useScrollReveal();
  const studentsCountRef = useCountUp(10, { suffix: "K+" });
  const oppsCountRef = useCountUp(500, { suffix: "+" });
  const readinessCountRef = useCountUp(85, { suffix: "%" });

  return (
    <div ref={scrollRef} className="min-h-screen bg-[#060818] text-foreground overflow-x-hidden selection:bg-primary/30">
      <SiteHeader />

      {/* ----------------- HERO SECTION ----------------- */}
      <section className="relative pt-32 pb-20 md:pt-36 md:pb-28 overflow-hidden">
        {/* Ambient atmospheric glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[550px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-40 right-[-10%] w-[500px] h-[500px] bg-purple-600/10 blur-[120px] -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headlines & CTAs */}
            <div className="lg:col-span-7 space-y-7 text-center lg:text-left" data-reveal="up">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-xs font-semibold text-blue-300 shadow-[0_0_20px_rgba(79,124,255,0.2)]">
                <Sparkles className="size-3.5 text-cyan-400 animate-pulse" />
                <span>Bridging Skills. Careers. Opportunities.</span>
              </div>

              {/* Headline */}
              <h1 className="font-heading text-4xl sm:text-6xl lg:text-[68px] font-bold tracking-tight text-white leading-[1.08]">
                Your Skills Today. <br />
                <span className="text-gradient">A Better Tomorrow.</span>
              </h1>

              {/* Subhead */}
              <p className="text-base sm:text-lg text-slate-300/90 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                An AI-powered career intelligence platform that analyzes your skills, identifies gaps, creates a personalized roadmap, and connects you with real opportunities.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button variant="gradient" size="lg" className="w-full sm:w-auto rounded-xl px-7 text-base shadow-xl shadow-blue-500/25">
                    <span>Get Started Free</span>
                    <ArrowRight className="size-4 ml-2" />
                  </Button>
                </Link>

                <Link href="/resume" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-xl px-6 border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08]">
                    <Play className="size-4 mr-2 fill-white text-white" />
                    <span>Watch Demo</span>
                  </Button>
                </Link>
              </div>

              {/* Stats Row */}
              <div className="pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center lg:text-left" data-stagger>
                <div>
                  <div className="font-heading text-2xl sm:text-3xl font-bold text-white">
                    <span ref={studentsCountRef}>10K+</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">Students</div>
                </div>
                <div>
                  <div className="font-heading text-2xl sm:text-3xl font-bold text-white">
                    <span ref={oppsCountRef}>500+</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">Opportunities</div>
                </div>
                <div>
                  <div className="font-heading text-2xl sm:text-3xl font-bold text-white">
                    <span ref={readinessCountRef}>85%</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">Career Readiness</div>
                </div>
                <div>
                  <div className="font-heading text-2xl sm:text-3xl font-bold text-white flex items-center justify-center lg:justify-start gap-1">
                    <span>4.8</span>
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">User Rating</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual with Waypoint Chips */}
            <div className="lg:col-span-5 relative" data-reveal="scale">
              <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] group">
                <Image
                  src="/images/hero-path.jpg"
                  alt="Student on cliff overlooking glowing neon career path to futuristic city"
                  width={680}
                  height={480}
                  priority
                  style={{ width: "100%", height: "auto" }}
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Subtle vignette & color wash overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#060818] via-transparent to-transparent opacity-60" />

                {/* Floating Waypoint Glass Badges matching Mockup */}
                <div className="absolute top-[38%] right-[14%] flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass border border-white/20 text-xs font-semibold text-white shadow-xl backdrop-blur-md animate-bounce" style={{ animationDuration: "3s" }}>
                  <Briefcase className="size-3.5 text-cyan-400" />
                  <span>Get Hired</span>
                </div>

                <div className="absolute top-[52%] right-[32%] flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass border border-white/20 text-xs font-semibold text-white shadow-xl backdrop-blur-md animate-bounce" style={{ animationDuration: "4s" }}>
                  <Layers className="size-3.5 text-indigo-400" />
                  <span>Build</span>
                </div>

                <div className="absolute bottom-[24%] right-[18%] flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass border border-white/20 text-xs font-semibold text-white shadow-xl backdrop-blur-md animate-bounce" style={{ animationDuration: "3.5s" }}>
                  <TrendingUp className="size-3.5 text-emerald-400" />
                  <span>Grow</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ----------------- FEATURES SECTION ("Why CareerBridge AI?") ----------------- */}
      <section id="features" className="py-24 relative bg-[#090D1E]/60 border-y border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Header Intro */}
            <div className="lg:col-span-5 space-y-4" data-reveal="left">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-[0.15em]">
                <Sparkles className="size-3 text-cyan-400" />
                <span>Why CareerBridge AI?</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-5xl font-bold text-white tracking-tight leading-[1.15]">
                A Complete Career Journey for You
              </h2>
              <p className="text-slate-300/80 leading-relaxed text-base pt-1">
                From understanding your skills to getting real opportunities — CareerBridge AI guides you at every step.
              </p>

              <div className="pt-4">
                <Link href="/dashboard">
                  <Button variant="outline" className="border-white/15 text-white hover:bg-white/10 rounded-xl">
                    <span>Explore Dashboard</span>
                    <ArrowRight className="size-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right 4 Grid Feature Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5" data-stagger>
              
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-primary/40 transition-all duration-300 group shadow-lg">
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
              <div className="p-6 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-violet-500/40 transition-all duration-300 group shadow-lg">
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
              <div className="p-6 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-emerald-500/40 transition-all duration-300 group shadow-lg">
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
              <div className="p-6 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-cyan-500/40 transition-all duration-300 group shadow-lg">
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

        </div>
      </section>

      {/* ----------------- INTERACTIVE PRODUCT FLOW / PREVIEW ----------------- */}
      <section className="py-24 relative overflow-hidden">
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
            ].map((s, idx) => (
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
                  Based on standard demo profile analysis: 12 matched skills, 4 partial competencies, and 3 priority gaps identified to reach 85%+ readiness.
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
