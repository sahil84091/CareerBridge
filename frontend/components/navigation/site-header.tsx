"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[#07162e]/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex h-20 max-w-[1360px] items-center justify-between gap-4">
        {/* Logo */}
        <Logo />

        {/* Center Navigation Links */}
        <nav className="hidden items-center gap-8 text-sm font-medium text-blue-100/75 md:flex">
          <a href="#features" className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
            Product
          </a>
          <a href="#how-it-works" className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
            How it works
          </a>
          <a href="#features" className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
            For students
          </a>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="hidden h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-violet-600 px-6 text-sm font-semibold text-white shadow-[0_0_28px_rgba(43,125,255,0.4)] transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:inline-flex">
            <span>Get started</span>
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>

        {/* Mobile menu button */}
        <button
          type="button"
          className="rounded-lg p-2 text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <nav id="mobile-navigation" aria-label="Main navigation" className="mx-auto mb-4 max-w-[1360px] space-y-1 rounded-2xl border border-white/10 bg-[#0a1933]/95 p-4 text-sm shadow-2xl md:hidden">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-3 font-medium text-white hover:bg-white/[0.05]"
          >
            Product
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-3 text-blue-100/75 hover:bg-white/[0.05] hover:text-white"
          >
            How it works
          </a>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-3 text-blue-100/75 hover:bg-white/[0.05] hover:text-white"
          >
            For students
          </a>
          <div className="border-t border-white/10 pt-3">
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-violet-600 px-5 font-semibold text-white shadow-[0_0_28px_rgba(43,125,255,0.4)]">
              Get started <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
