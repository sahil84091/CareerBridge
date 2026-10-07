"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  User,
  FileText,
  Compass,
  BarChart2,
  Route,
  Briefcase,
  Settings,
  Search,
  Bell,
  UploadCloud,
  ChevronRight,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { DataSourceBadge } from "@/components/shared/primitives";
import { useSession, clearSession } from "@/lib/session";
import type { DataSource } from "@/lib/api";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  dataSource?: DataSource | null;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/resume", label: "Resume", icon: FileText },
  { href: "/career-explorer", label: "Career Explorer", icon: Compass },
  { href: "/skill-gap", label: "Skill Gap", icon: BarChart2 },
  { href: "/roadmap", label: "Roadmap", icon: Route },
  { href: "/opportunities", label: "Opportunities", icon: Briefcase },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children, dataSource }: AppShellProps) {
  const pathname = usePathname();
  const session = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-[#070B14] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 z-40 bg-[#090D1E]/95 border-r border-white/[0.08] backdrop-blur-xl">
        {/* Brand */}
        <div className="h-20 flex items-center px-6 border-b border-white/[0.06]">
          <Logo href="/dashboard" />
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative",
                  isActive
                    ? "bg-primary/15 text-white border border-primary/30 shadow-[0_0_15px_rgba(79,124,255,0.2)]"
                    : "text-muted-foreground hover:text-white hover:bg-white/[0.04]"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary" />
                )}
                <Icon
                  className={cn(
                    "size-4.5 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-white"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card at bottom of sidebar */}
        <div className="p-4 border-t border-white/[0.06]">
          <Link
            href="/profile"
            className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.05] transition-all group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-9 rounded-full bg-brand flex items-center justify-center font-bold text-xs text-white shadow-md">
                {session.name ? session.name[0] : "U"}
              </div>
              <div className="min-w-0 text-left">
                <p className="text-xs font-semibold text-white truncate">
                  {session.name || "Sahil Kumar"}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">View Profile</p>
              </div>
            </div>
            <ChevronRight className="size-4 text-muted-foreground group-hover:text-white transition-colors" />
          </Link>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 bg-[#090D1E] border-r border-white/10 p-5 flex flex-col z-10">
            <div className="flex items-center justify-between pb-5 border-b border-white/10">
              <Logo href="/dashboard" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1.5 text-muted-foreground hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex-1 py-4 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                      isActive
                        ? "bg-primary/20 text-white border border-primary/40"
                        : "text-muted-foreground hover:text-white hover:bg-white/[0.04]"
                    )}
                  >
                    <Icon className={cn("size-4", isActive ? "text-primary" : "")} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Top Header */}
        <header className="h-20 sticky top-0 z-30 bg-[#070B14]/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <button
              type="button"
              className="lg:hidden p-2 text-muted-foreground hover:text-white rounded-lg"
              onClick={() => setMobileOpen(true)}
              aria-label="Open Sidebar"
            >
              <Menu className="size-6" />
            </button>

            {/* Search Input */}
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search careers, skills or opportunities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {dataSource && <DataSourceBadge source={dataSource} />}

            {/* Notification Bell */}
            <button
              type="button"
              className="relative p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-muted-foreground hover:text-white transition-all cursor-pointer"
              title="Notifications"
            >
              <Bell className="size-4.5" />
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary ring-2 ring-[#070B14]" />
            </button>

            {/* Upload New Resume CTA */}
            <Link href="/resume">
              <Button
                variant="gradient"
                size="sm"
                className="hidden md:inline-flex items-center gap-2 rounded-xl text-xs font-semibold px-4 shadow-lg shadow-blue-500/20"
              >
                <UploadCloud className="size-4" />
                <span>Upload New Resume</span>
              </Button>
            </Link>

            {/* User Avatar Circle */}
            <Link href="/profile">
              <div className="size-9 rounded-full bg-brand p-0.5 shadow-md ring-1 ring-white/10 hover:ring-primary transition-all">
                <div className="size-full rounded-full bg-[#090D1E] flex items-center justify-center font-bold text-xs text-white">
                  {session.name ? session.name[0] : "S"}
                </div>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
