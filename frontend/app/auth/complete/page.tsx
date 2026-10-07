"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { saveSession } from "@/lib/session";

export default function AuthCompletePage() {
  const router = useRouter();
  const [message, setMessage] = useState("Completing secure sign-in...");
  useEffect(() => {
    let active = true;
    api.currentUser()
      .then((user) => {
        if (!active) return;
        saveSession(user);
        return api.getProfile().then(({ data: profile }) => {
          if (!active) return;
          router.replace(profile.target_role_id ? "/dashboard" : "/onboarding");
        });
      })
      .catch(() => {
        if (!active) return;
        setMessage("Sign-in could not be completed. Please try again.");
        setTimeout(() => router.replace("/login"), 1800);
      });
    return () => { active = false; };
  }, [router]);
  return <main className="min-h-screen grid place-items-center bg-[#060818] text-sm text-slate-300">{message}</main>;
}
