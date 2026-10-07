import Link from "next/link";
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Cpu, 
  Target, 
  Compass, 
  FileCheck, 
  BarChart3, 
  TrendingUp,
  CheckCircle2,
  ChevronRight
} from "lucide-react";

export default function LandingPage() {
  const steps = [
    {
      step: "01",
      title: "Understand Me",
      description: "AI extracts skills, education, projects, and work history from your resume into a verified capability graph.",
      icon: FileCheck,
      badge: "Resume AI",
      color: "from-blue-500/20 to-cyan-500/10 border-blue-500/30",
    },
    {
      step: "02",
      title: "Identify My Gap",
      description: "Benchmarks your capabilities against target career requirements to detect exact missing and partial competencies.",
      icon: Target,
      badge: "Skill Gap Engine",
      color: "from-purple-500/20 to-indigo-500/10 border-purple-500/30",
    },
    {
      step: "03",
      title: "Guide Me",
      description: "Generates a structured 5-phase career roadmap with actionable learning milestones and capstone projects.",
      icon: Compass,
      badge: "Personalized Roadmap",
      color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30",
    },
    {
      step: "04",
      title: "Connect Me",
      description: "Matches you with high-signal job and internship opportunities based on real capability fit and growth trajectory.",
      icon: TrendingUp,
      badge: "Opportunity Matcher",
      color: "from-amber-500/20 to-orange-500/10 border-amber-500/30",
    },
  ];

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full py-16 md:py-24 flex flex-col items-center text-center">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/15 via-purple-600/15 to-pink-600/10 blur-3xl rounded-full pointer-events-none -z-10" />

        {/* Top Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-blue-500/30 text-xs font-semibold text-blue-300 mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Hackathon Edition • Career Intelligence Platform</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6">
          Bridge the Gap Between{" "}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Your Skills
          </span>{" "}
          and Real Career Success.
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl text-base sm:text-lg text-slate-400 mb-10 leading-relaxed font-normal">
          CareerBridge AI deeply parses your profile, benchmarks you against live industry roles, pinpoints exact skill gaps, and engineers your step-by-step career roadmap.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Launch Live Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/resume"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm glass-panel border border-slate-700 hover:border-slate-500 text-slate-200 transition-all hover:bg-slate-800/40"
          >
            <FileCheck className="w-4 h-4 text-blue-400" />
            <span>Upload Resume (AI Test)</span>
          </Link>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 w-full max-w-4xl text-left">
          <div className="glass-panel p-4 rounded-xl border border-slate-800/80">
            <span className="text-2xl font-black text-white">72%</span>
            <p className="text-xs text-slate-400 mt-1">Average Readiness Score</p>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-slate-800/80">
            <span className="text-2xl font-black text-blue-400">5 Phases</span>
            <p className="text-xs text-slate-400 mt-1">Personalized Roadmaps</p>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-slate-800/80">
            <span className="text-2xl font-black text-purple-400">28+ Skills</span>
            <p className="text-xs text-slate-400 mt-1">Normalized Taxonomy</p>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-slate-800/80">
            <span className="text-2xl font-black text-emerald-400">Instant</span>
            <p className="text-xs text-slate-400 mt-1">Opportunity Matching</p>
          </div>
        </div>
      </section>

      {/* Product Flow Section */}
      <section className="w-full py-16 border-t border-slate-850">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-xs uppercase tracking-widest font-bold text-blue-400 mb-2">The Intelligence Pipeline</h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How CareerBridge AI Directs Your Journey
          </h3>
          <p className="text-slate-400 text-sm mt-3">
            An automated end-to-end loop transforming raw resumes into career acceleration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="glass-panel p-6 rounded-2xl border glass-panel-hover flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-slate-700 font-mono">{item.step}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                      {item.badge}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-800/90 flex items-center justify-center text-blue-400 mb-4 border border-slate-700/60">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-1.5 text-xs text-blue-400 font-medium">
                  <span>Explore Feature</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Demo Persona Spotlight */}
      <section className="w-full py-16 border-t border-slate-850">
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-slate-900/90 via-slate-950 to-indigo-950/20 relative overflow-hidden">
          <div className="max-w-2xl">
            <span className="text-xs uppercase font-bold text-indigo-400 tracking-wider">Turnkey Hackathon Demonstration</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 mb-4">
              Pre-Loaded Demo Persona: Full Stack Developer
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Test every step of the product right now. Profile data, realistic skill comparisons, 5-phase career milestone roadmap, and real matched opportunities are live and ready to inspect.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-2 transition-all shadow-md shadow-blue-600/30"
              >
                <span>View Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/skill-gap"
                className="px-5 py-2.5 rounded-xl glass-panel border border-slate-700 text-slate-300 hover:text-white font-medium text-xs flex items-center gap-2"
              >
                <span>Inspect Skill Gap Radar</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
