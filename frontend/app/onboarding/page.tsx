"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowRight, ArrowLeft, Sparkles, Compass, GraduationCap, Code } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import type { CareerRole, Profile, UserSkillItem } from "@/types";
import { cn } from "@/lib/utils";

const popularSkills = [
  "JavaScript", "TypeScript", "React", "Node.js", "Python",
  "HTML", "CSS", "Tailwind CSS", "Git", "SQL", "PostgreSQL",
  "Docker", "AWS", "REST API", "Figma", "Machine Learning"
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [currentTitleDraft, setCurrentTitleDraft] = useState<string | null>(null);
  const [educationLevelDraft, setEducationLevelDraft] = useState<string | null>(null);
  const [experienceLevelDraft, setExperienceLevelDraft] = useState<string | null>(null);
  const [selectedRoleDraft, setSelectedRoleDraft] = useState<string | null>(null);
  const [selectedSkillsDraft, setSelectedSkillsDraft] = useState<string[] | null>(null);
  const [customSkill, setCustomSkill] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { data: careers, loading: careersLoading, error: careersError, reload: reloadCareers } =
    useApi<CareerRole[]>(() => api.getCareers());
  const { data: profile, loading: profileLoading, error: profileError, reload: reloadProfile } =
    useApi<Profile>(() => api.getProfile());
  const { data: userSkills, loading: skillsLoading, error: skillsError, reload: reloadSkills } =
    useApi<UserSkillItem[]>(() => api.getUserSkills());

  const hydrated = Boolean(profile && userSkills);
  const currentTitle = currentTitleDraft ?? profile?.current_title ?? "";
  const educationLevel = educationLevelDraft ?? profile?.education_level ?? "";
  const experienceLevel = experienceLevelDraft ?? profile?.experience_level ?? "";
  const selectedRole = selectedRoleDraft ?? profile?.target_role_id ?? "";
  const selectedSkills = selectedSkillsDraft ?? userSkills?.map((skill) => skill.skill_name) ?? [];
  const selectedRoleId = careers?.some((role) => role.id === selectedRole) ? selectedRole : "";
  const loadError = profileError || skillsError;
  const loadingSavedData = profileLoading || skillsLoading || !hydrated;

  const toggleSkill = (skill: string) => {
    setSelectedSkillsDraft((prev) =>
      (prev ?? userSkills?.map((item) => item.skill_name) ?? []).includes(skill)
        ? (prev ?? userSkills?.map((item) => item.skill_name) ?? []).filter((s) => s !== skill)
        : [...(prev ?? userSkills?.map((item) => item.skill_name) ?? []), skill]
    );
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkillsDraft([...selectedSkills, customSkill.trim()]);
      setCustomSkill("");
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const roleObj = careers?.find((c) => c.id === selectedRoleId);
      if (!roleObj) throw new Error("Choose a career role before continuing.");
      await api.updateProfile({
        current_title: currentTitle.trim(),
        education_level: educationLevel,
        experience_level: experienceLevel,
        target_role_id: selectedRoleId,
        target_role_title: roleObj.title,
      });
      const selectedNames = new Set(selectedSkills.map((skill) => skill.trim().toLowerCase()));
      await Promise.all((userSkills ?? [])
        .filter((skill) => !selectedNames.has(skill.skill_name.toLowerCase()))
        .map((skill) => api.deleteUserSkill(skill.id)));
      const existingNames = new Set((userSkills ?? []).map((skill) => skill.skill_name.toLowerCase()));
      await Promise.all(selectedSkills
        .filter((skill) => !existingNames.has(skill.trim().toLowerCase()))
        .map((skill) => api.addUserSkill(skill.trim(), "Moderate")));
      router.push("/dashboard");
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Could not save your onboarding information.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060818] flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-white/10">
        <Logo href="/" />
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <span>Step {step} of 3</span>
          <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden ml-2">
            <div
              className="h-full bg-brand rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Form Content */}
      <main className="max-w-2xl mx-auto w-full my-auto py-8">
        {saveError && <p role="alert" className="mb-4 text-sm text-red-400">{saveError}</p>}
        {loadingSavedData && (loadError ? (
          <div role="alert" className="mb-4 text-sm text-red-400">
            <p>Could not load your saved profile and skills: {loadError}</p>
            <Button type="button" variant="outline" onClick={() => { reloadProfile(); reloadSkills(); }} className="mt-3">
              Retry loading
            </Button>
          </div>
        ) : (
          <p role="status" className="mb-4 text-sm text-muted-foreground">Loading your saved profile and skills…</p>
        ))}
        
        {/* Step 1: Background & Education */}
        {step === 1 && (
          <div className="surface p-8 sm:p-10 rounded-3xl border border-white/10 shadow-2xl space-y-6">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-primary">
              <GraduationCap className="size-4 text-cyan-400" />
              <span>Background & Education</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">
              Tell us about where you are right now.
            </h1>
            <p className="text-sm text-muted-foreground">
              CareerBridge personalizes your career benchmarks and salary expectations based on your stage.
            </p>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Current Title or Role
                </label>
                <Input
                  value={currentTitle}
                  onChange={(e) => setCurrentTitleDraft(e.target.value)}
                  disabled={!hydrated}
                  placeholder="e.g. Student, Junior Software Engineer, Bootcamp Grad"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Education Level
                </label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevelDraft(e.target.value)}
                  disabled={!hydrated}
                  className="w-full h-11 rounded-xl border border-input bg-card/60 px-3.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                >
                  <option value="">Select education level</option>
                  <option value="High School">High School</option>
                  <option value="Associate Degree">Associate Degree</option>
                  <option value="Bachelor's Degree">Bachelor&apos;s Degree</option>
                  <option value="Master's Degree">Master&apos;s Degree</option>
                  <option value="Self-Taught / Bootcamp">Self-Taught / Bootcamp</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Experience Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["Entry Level", "Mid Level", "Senior"].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setExperienceLevelDraft(lvl)}
                      disabled={!hydrated}
                      className={cn(
                        "p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer",
                        experienceLevel === lvl
                          ? "border-primary bg-primary/20 text-white"
                          : "border-white/10 bg-white/[0.02] text-muted-foreground hover:bg-white/5 hover:text-white"
                      )}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button variant="gradient" onClick={() => setStep(2)} disabled={!hydrated} className="rounded-xl px-6">
                <span>Continue to Target Role</span>
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Target Career Selection */}
        {step === 2 && (
          <div className="surface p-8 sm:p-10 rounded-3xl border border-white/10 shadow-2xl space-y-6">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-primary">
              <Compass className="size-4 text-cyan-400" />
              <span>Target Role Selection</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">
              What role are you targeting next?
            </h1>
            <p className="text-sm text-muted-foreground">
              Select the career path you want to compare your current profile against.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-h-80 overflow-y-auto pr-1">
              {(careers ?? []).map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedRoleDraft(c.id)}
                  className={cn(
                    "p-4 rounded-xl border cursor-pointer transition-all text-left",
                    selectedRoleId === c.id
                      ? "border-primary bg-primary/20 shadow-md ring-1 ring-primary"
                      : "border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-white/20"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{c.title}</span>
                    {selectedRoleId === c.id && <Check className="size-4 text-primary" />}
                  </div>
                  <span className="text-[11px] text-muted-foreground block mt-1">{c.average_salary}</span>
                </div>
              ))}
              {careersLoading && <p className="text-sm text-muted-foreground">Loading career paths…</p>}
              {careersError && <p role="alert" className="text-sm text-red-400">Could not load career paths. <button type="button" onClick={reloadCareers} className="underline">Retry</button></p>}
              {!careersLoading && !careers?.length && <p className="text-sm text-muted-foreground">No career paths are available.</p>}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <Button variant="ghost" onClick={() => setStep(1)} className="rounded-xl">
                <ArrowLeft className="size-4 mr-2" />
                <span>Back</span>
              </Button>
              <Button variant="gradient" onClick={() => setStep(3)} disabled={!selectedRoleId || careersLoading} className="rounded-xl px-6">
                <span>Continue to Skills</span>
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Current Skills */}
        {step === 3 && (
          <div className="surface p-8 sm:p-10 rounded-3xl border border-white/10 shadow-2xl space-y-6">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-primary">
              <Code className="size-4 text-cyan-400" />
              <span>Skills Inventory</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">
              Select your current skills.
            </h1>
            <p className="text-sm text-muted-foreground">
              Tap the technologies you already know. You can also upload a full resume right after.
            </p>

            {/* Popular skill pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {popularSkills.map((s) => {
                const selected = selectedSkills.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSkill(s)}
                    disabled={!hydrated}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer",
                      selected
                        ? "border-primary bg-primary/25 text-white ring-1 ring-primary/40 shadow-sm"
                        : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/25 hover:text-white"
                    )}
                  >
                    {selected && <Check className="size-3 inline mr-1 text-primary" />}
                    {s}
                  </button>
                );
              })}
            </div>

            {/* Custom skill add input */}
            <div className="flex items-center gap-2 pt-2">
              <Input
                placeholder="Add other skill (e.g. Next.js, GraphQL)"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                disabled={!hydrated}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSkill())}
                className="h-10 text-xs"
              />
              <Button type="button" variant="outline" onClick={addCustomSkill} disabled={!hydrated} className="h-10 text-xs">
                Add
              </Button>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <Button variant="ghost" onClick={() => setStep(2)} className="rounded-xl">
                <ArrowLeft className="size-4 mr-2" />
                <span>Back</span>
              </Button>
              <Button
                variant="gradient"
                onClick={handleFinish}
                disabled={saving || !hydrated || !selectedRoleId}
                className="rounded-xl px-7 shadow-lg shadow-blue-500/25"
              >
                <Sparkles className="size-4 mr-2" />
                <span>{saving ? "Generating Dashboard..." : "Generate Career Dashboard"}</span>
              </Button>
            </div>
          </div>
        )}

      </main>

      {/* Bottom Footer */}
      <footer className="max-w-4xl mx-auto w-full pt-6 border-t border-white/10 text-center text-xs text-muted-foreground">
        CareerBridge AI Career Intelligence Platform • Setup
      </footer>
    </div>
  );
}
