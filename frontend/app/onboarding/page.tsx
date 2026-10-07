"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowRight, ArrowLeft, Sparkles, Compass, Briefcase, GraduationCap, Code } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { demoCareers } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const popularSkills = [
  "JavaScript", "TypeScript", "React", "Node.js", "Python",
  "HTML", "CSS", "Tailwind CSS", "Git", "SQL", "PostgreSQL",
  "Docker", "AWS", "REST API", "Figma", "Machine Learning"
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [currentTitle, setCurrentTitle] = useState("CS Student / Junior Developer");
  const [educationLevel, setEducationLevel] = useState("Bachelor's Degree");
  const [experienceLevel, setExperienceLevel] = useState("Entry Level");
  const [selectedRole, setSelectedRole] = useState("role_fullstack");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "JavaScript", "HTML", "CSS", "Git", "React", "TypeScript"
  ]);
  const [customSkill, setCustomSkill] = useState("");
  const [saving, setSaving] = useState(false);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills([...selectedSkills, customSkill.trim()]);
      setCustomSkill("");
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const roleObj = demoCareers.find((c) => c.id === selectedRole);
      await api.updateProfile({
        current_title: currentTitle,
        education_level: educationLevel,
        experience_level: experienceLevel,
        target_role_id: selectedRole,
        target_role_title: roleObj?.title || "Full Stack Developer",
      });
      // Add selected skills
      for (const skill of selectedSkills) {
        await api.addUserSkill(skill, "Moderate").catch(() => {});
      }
    } catch (e) {
      // Ignore errors in mock mode
    } finally {
      setSaving(false);
      router.push("/dashboard");
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
                  onChange={(e) => setCurrentTitle(e.target.value)}
                  placeholder="e.g. Student, Junior Software Engineer, Bootcamp Grad"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Education Level
                </label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full h-11 rounded-xl border border-input bg-card/60 px-3.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                >
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
                      onClick={() => setExperienceLevel(lvl)}
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
              <Button variant="gradient" onClick={() => setStep(2)} className="rounded-xl px-6">
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
              {demoCareers.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedRole(c.id)}
                  className={cn(
                    "p-4 rounded-xl border cursor-pointer transition-all text-left",
                    selectedRole === c.id
                      ? "border-primary bg-primary/20 shadow-md ring-1 ring-primary"
                      : "border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-white/20"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{c.title}</span>
                    {selectedRole === c.id && <Check className="size-4 text-primary" />}
                  </div>
                  <span className="text-[11px] text-muted-foreground block mt-1">{c.average_salary}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <Button variant="ghost" onClick={() => setStep(1)} className="rounded-xl">
                <ArrowLeft className="size-4 mr-2" />
                <span>Back</span>
              </Button>
              <Button variant="gradient" onClick={() => setStep(3)} className="rounded-xl px-6">
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
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSkill())}
                className="h-10 text-xs"
              />
              <Button type="button" variant="outline" onClick={addCustomSkill} className="h-10 text-xs">
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
                disabled={saving}
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
