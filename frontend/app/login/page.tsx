"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const beginSignIn = () => {
    setLoading(true);
    setError(null);
    api.startGoogleLogin();
  };

  return (
    <main className="min-h-screen bg-[#060818] flex flex-col lg:flex-row">
      <section className="relative lg:w-1/2 p-8 lg:p-14 flex flex-col justify-between overflow-hidden min-h-[420px] lg:min-h-screen">
        <div className="absolute inset-0 z-0">
          <Image src="/images/auth-side.jpg" alt="A person working on a laptop at twilight" fill priority className="object-cover object-center opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060818] via-[#060818]/60 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#060818]" />
        </div>
        <div className="relative z-10"><Logo /></div>
        <div className="relative z-10 max-w-md space-y-4 my-auto py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-black/40 text-xs font-semibold text-blue-300 backdrop-blur-md">
            <Sparkles className="size-3 text-cyan-400" />
            <span>Bridging Skills. Careers. Opportunities.</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight">Build your next career move.</h1>
          <p className="text-base sm:text-lg text-slate-200/90">Sign in to map your skills, plan your next steps, and find relevant opportunities.</p>
        </div>
        <div className="relative z-10 flex items-center gap-3 text-xs text-slate-400">
          <ShieldCheck className="size-4 text-emerald-400" />
          <span>Your CareerBridge session is protected.</span>
        </div>
      </section>
      <section className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md surface p-8 sm:p-10 rounded-3xl border border-white/10 shadow-2xl">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-2">Sign in to CareerBridge</h2>
          <p className="text-sm text-muted-foreground mb-8">Use your Google account to continue to your personalized career workspace.</p>
          {error && <div role="alert" className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">{error}</div>}
          <Button type="button" onClick={beginSignIn} disabled={loading} variant="gradient" className="w-full h-12 rounded-xl font-semibold">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="mr-2 size-5">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.09-1.92 3.27-4.74 3.27-8.1Z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.28-1.93-6.15-4.53H2.16v2.84A11 11 0 0 0 12 23Z" />
              <path fill="#FBBC05" d="M5.85 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.16a11 11 0 0 0 0 9.9l3.69-2.84Z" />
              <path fill="#EA4335" d="M12 5.36c1.62 0 3.07.56 4.21 1.64l3.15-3.15C17.45 2.05 14.97 1 12 1a11 11 0 0 0-9.84 6.05l3.69 2.84C6.72 7.29 9.14 5.36 12 5.36Z" />
            </svg>
            {loading ? "Redirecting to Google…" : "Continue with Google"}
            <ArrowRight className="ml-auto size-4" />
          </Button>
          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">By continuing, you allow CareerBridge to use your Google account’s verified email and profile name to create or access your account.</p>
        </div>
      </section>
    </main>
  );
}
