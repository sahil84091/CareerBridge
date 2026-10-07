"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Compass, 
  FileText, 
  Layers, 
  Map, 
  Briefcase, 
  User, 
  Sparkles,
  BarChart2
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart2 },
    { name: "Resume AI", href: "/resume", icon: FileText },
    { name: "Skill Gap", href: "/skill-gap", icon: Layers },
    { name: "Roadmap", href: "/roadmap", icon: Map },
    { name: "Careers", href: "/career-explorer", icon: Compass },
    { name: "Opportunities", href: "/opportunities", icon: Briefcase },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                CareerBridge
              </span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Career Intelligence & Gap Radar</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm shadow-blue-500/20"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Action: Demo User Status */}
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 hover:border-slate-500 text-xs text-slate-200 transition-all"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
              DU
            </div>
            <div className="hidden sm:block text-left">
              <span className="block font-semibold leading-none text-slate-100">Demo User</span>
              <span className="text-[10px] text-blue-400 font-medium leading-tight">Full Stack Developer</span>
            </div>
          </Link>
        </div>

      </div>
    </header>
  );
}
