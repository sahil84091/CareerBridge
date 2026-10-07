"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  User,
  FileText,
  Compass,
  BarChart2,
  Route,
  Briefcase,
  Settings,
  Search,
  UploadCloud,
  ChevronRight,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { DataSourceBadge } from "@/components/shared/primitives";
import { useSession, clearSession, saveSession } from "@/lib/session";
import { api } from "@/lib/api";
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

const SIDEBAR_PREFERENCE_KEY = "careerbridge-sidebar-collapsed";
let cachedSidebarCollapsed: boolean | undefined;
const sidebarPreferenceListeners = new Set<() => void>();

function getSidebarPreference() {
  if (typeof window === "undefined") return false;
  if (cachedSidebarCollapsed !== undefined) return cachedSidebarCollapsed;

  try {
    cachedSidebarCollapsed = window.localStorage.getItem(SIDEBAR_PREFERENCE_KEY) === "true";
  } catch {
    cachedSidebarCollapsed = false;
  }
  return cachedSidebarCollapsed;
}

function subscribeToSidebarPreference(listener: () => void) {
  sidebarPreferenceListeners.add(listener);
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== SIDEBAR_PREFERENCE_KEY) return;
    cachedSidebarCollapsed = event.newValue === "true";
    listener();
  };
  window.addEventListener("storage", handleStorage);
  return () => {
    sidebarPreferenceListeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function setSidebarPreference(collapsed: boolean) {
  cachedSidebarCollapsed = collapsed;
  try {
    window.localStorage.setItem(SIDEBAR_PREFERENCE_KEY, String(collapsed));
  } catch {
    // Keep the in-memory preference available during client-side navigation.
  }
  sidebarPreferenceListeners.forEach((listener) => listener());
}

export function AppShell({ children, dataSource }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const sidebarCollapsed = useSyncExternalStore(
    subscribeToSidebarPreference,
    getSidebarPreference,
    () => false,
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let active = true;
    api.currentUser()
      .then((user) => {
        if (!active) return;
        saveSession(user);
        setAuthChecked(true);
      })
      .catch(() => {
        if (!active) return;
        clearSession();
        router.replace("/login");
      });
    return () => { active = false; };
  }, [router]);

  const toggleSidebar = () => {
    setSidebarPreference(!sidebarCollapsed);
  };

  if (!authChecked) {
    return <main className="min-h-screen grid place-items-center bg-[#070B14] text-sm text-slate-400">Checking your session…</main>;
  }

  return (
    <div className="min-h-screen bg-[#070B14] flex">
      {/* Desktop Sidebar */}
      <aside className={cn("fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-white/[0.08] bg-[#090D1E]/95 backdrop-blur-xl transition-[width] duration-300 ease-in-out lg:flex", sidebarCollapsed ? "w-[4.75rem]" : "w-64")}>
        {/* Brand */}
        <div className={cn("flex h-20 items-center border-b border-white/[0.06] transition-all duration-300 ease-in-out", sidebarCollapsed ? "justify-center px-2" : "justify-center px-5")}>
          {sidebarCollapsed ? (
            <Link href="/" aria-label="CareerBridge homepage" title="CareerBridge homepage" className="flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
              <LogoMark className="size-10 shrink-0" />
            </Link>
          ) : (
            <Logo href="/" />
          )}
        </div>

        {/* Navigation list */}
        <nav id="desktop-navigation" aria-label="Main navigation" className={cn("flex-1 space-y-1.5 overflow-y-auto py-6 transition-all duration-300 ease-in-out", sidebarCollapsed ? "px-2" : "px-4")}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={sidebarCollapsed ? item.label : undefined}
                aria-label={sidebarCollapsed ? item.label : undefined}
                className={cn(
                  "group relative flex items-center rounded-xl py-2.5 text-sm font-medium transition-all duration-300 ease-in-out",
                  sidebarCollapsed ? "justify-center px-0" : "gap-3.5 px-3.5",
                  isActive
                    ? "bg-primary/15 text-white border border-primary/30 shadow-[0_0_15px_rgba(79,124,255,0.2)]"
                    : "text-muted-foreground hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <Icon
                  className={cn(
                    "size-4.5 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-white"
                  )}
                />
                <span className={cn("overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ease-in-out", sidebarCollapsed ? "max-w-0 opacity-0" : "max-w-40 opacity-100")}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card at bottom of sidebar */}
        <div className={cn("border-t border-white/[0.06]", sidebarCollapsed ? "p-2" : "p-4")}>
          <Link
            href="/profile"
            title={sidebarCollapsed ? "View Profile" : undefined}
            aria-label={sidebarCollapsed ? "View Profile" : undefined}
            className={cn("group flex items-center rounded-xl border border-white/[0.05] bg-white/[0.03] transition-all hover:bg-white/[0.07]", sidebarCollapsed ? "justify-center p-2" : "justify-between p-2.5")}
          >
            <div className={cn("flex min-w-0 items-center", sidebarCollapsed ? "justify-center" : "gap-3")}>
              <div className="size-9 rounded-full bg-brand flex items-center justify-center font-bold text-xs text-white shadow-md">
                {session?.full_name ? session.full_name[0] : "U"}
              </div>
              <div className={cn("min-w-0 overflow-hidden text-left whitespace-nowrap transition-[max-width,opacity] duration-200 ease-in-out", sidebarCollapsed ? "max-w-0 opacity-0" : "max-w-40 opacity-100")}>
                <p className="text-xs font-semibold text-white truncate">
                  {session?.full_name || "CareerBridge user"}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">View Profile</p>
              </div>
            </div>
            <ChevronRight className={cn("size-4 shrink-0 text-muted-foreground transition-[opacity,max-width] duration-200 group-hover:text-white", sidebarCollapsed ? "max-w-0 opacity-0" : "max-w-4 opacity-100")} />
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
          <div id="mobile-navigation" className="relative z-10 flex w-72 flex-col border-r border-white/10 bg-[#090D1E] p-5">
            <div className="flex items-center justify-between pb-5 border-b border-white/10">
              <Logo href="/dashboard" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close sidebar"
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
      <div className={cn("flex min-w-0 flex-1 flex-col transition-[padding] duration-300 ease-in-out", sidebarCollapsed ? "lg:pl-[4.75rem]" : "lg:pl-64")}>
        {/* Top Header */}
        <header className="h-20 sticky top-0 z-30 bg-[#070B14]/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!sidebarCollapsed}
              aria-controls="desktop-navigation"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden size-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 lg:grid"
            >
              {sidebarCollapsed ? <PanelLeftOpen className="size-4" aria-hidden="true" /> : <PanelLeftClose className="size-4" aria-hidden="true" />}
            </button>
            <button
              type="button"
              className="lg:hidden p-2 text-muted-foreground hover:text-white rounded-lg"
              onClick={() => setMobileOpen(true)}
              aria-label="Open Sidebar"
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
            >
              <Menu className="size-6" />
            </button>

            {/* Search Input */}
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search careers and skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    router.push(`/career-explorer?search=${encodeURIComponent(searchQuery.trim())}`);
                    setSearchQuery("");
                  }
                }}
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {dataSource && <DataSourceBadge source={dataSource} />}

            <Link
              href="/"
              aria-label="Go to homepage"
              title="Homepage"
              className="grid size-9 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-muted-foreground transition hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              <Home className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/dashboard"
              aria-label="Go to dashboard"
              title="Dashboard"
              className="grid size-9 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-muted-foreground transition hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              <LayoutDashboard className="size-4" aria-hidden="true" />
            </Link>

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
                  {session?.full_name ? session.full_name[0] : "U"}
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
