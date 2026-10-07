"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ArrowRight, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-5 sm:px-6 rounded-2xl glass border border-white/10 shadow-2xl shadow-black/40 backdrop-blur-xl">
        {/* Logo */}
        <Logo />

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="/" className="text-white hover:text-primary transition-colors">
            Home
          </Link>
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#students" className="hover:text-white transition-colors">
            For Students
          </a>
          <a href="#recruiters" className="hover:text-white transition-colors">
            For Recruiters
          </a>
          <a href="#about" className="hover:text-white transition-colors">
            About
          </a>
        </nav>

        {/* Right CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
              Sign In
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="gradient" size="sm" className="rounded-xl px-5">
              <span>Get Started</span>
              <ArrowRight className="size-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 p-5 rounded-2xl glass border border-white/10 text-sm space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-white font-medium"
          >
            Home
          </Link>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-muted-foreground hover:text-white"
          >
            Features
          </a>
          <a
            href="#students"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-muted-foreground hover:text-white"
          >
            For Students
          </a>
          <a
            href="#recruiters"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-muted-foreground hover:text-white"
          >
            For Recruiters
          </a>
          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-muted-foreground hover:text-white"
          >
            About
          </a>
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full">
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="gradient" className="w-full">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
