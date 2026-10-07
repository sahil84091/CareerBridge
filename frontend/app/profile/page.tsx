"use client";

import { useState } from "react";
import {
  User,
  Mail,
  GraduationCap,
  Briefcase,
  Plus,
  Trash2,
  CheckCircle2,
  Save,
  Edit2,
  X,
} from "lucide-react";
import { AppShell } from "@/components/navigation/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PanelSkeleton, ErrorState } from "@/components/shared/primitives";
import { api } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import type { Profile, UserSkillItem } from "@/types";

export default function ProfilePage() {
  const { data: profile, loading, error, reload: reloadProfile, source } = useApi<Profile>(() =>
    api.getProfile()
  );
  const { data: skills, reload: reloadSkills } = useApi<UserSkillItem[]>(() =>
    api.getUserSkills()
  );

  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(profile?.bio || "");
  const [currentTitle, setCurrentTitle] = useState(profile?.current_title || "");
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillProficiency, setNewSkillProficiency] = useState("Moderate");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleSaveProfile = async () => {
    setSaving(true);
    setActionError(null);
    try {
      await api.updateProfile({
        bio: bio || profile?.bio,
        current_title: currentTitle || profile?.current_title,
      });
      reloadProfile();
      setIsEditing(false);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    try {
      setActionError(null);
      await api.addUserSkill(newSkillName.trim(), newSkillProficiency);
      setNewSkillName("");
      reloadSkills();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not add skill.");
    }
  };

  const handleDeleteSkill = async (id: string) => {
    try {
      setActionError(null);
      await api.deleteUserSkill(id);
      reloadSkills();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not remove skill.");
    }
  };

  return (
    <AppShell dataSource={source}>
      <div className="space-y-8">
        {actionError && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{actionError}</p>}
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
              <User className="size-7 text-primary" />
              <span>User Profile & Competencies</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your career profile, education details, and recorded skills.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setBio(profile?.bio || "");
              setCurrentTitle(profile?.current_title || "");
              setIsEditing(!isEditing);
            }}
            className="rounded-xl border-white/10 hover:bg-white/5 text-xs text-slate-300"
          >
            {isEditing ? (
              <>
                <X className="size-3.5 mr-1.5" />
                <span>Cancel</span>
              </>
            ) : (
              <>
                <Edit2 className="size-3.5 mr-1.5 text-primary" />
                <span>Edit Profile</span>
              </>
            )}
          </Button>
        </div>

        {loading ? (
          <div className="space-y-6">
            <PanelSkeleton lines={4} />
            <PanelSkeleton lines={5} />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={reloadProfile} />
        ) : profile ? (
          <div className="space-y-8">
            
            {/* Profile Overview Card */}
            <div className="surface p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="size-20 rounded-2xl bg-brand p-1 shadow-lg ring-2 ring-primary/40">
                  <div className="size-full rounded-xl bg-[#090D1E] flex items-center justify-center font-bold text-2xl text-white">
                    {profile.full_name ? profile.full_name[0] : "S"}
                  </div>
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-heading text-2xl font-bold text-white">
                      {profile.full_name}
                    </h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/20 text-blue-200 border border-primary/30 font-semibold">
                      {profile.experience_level || "Experience not provided"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 font-medium">
                    {profile.current_title || "Current title not provided"}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1.5">
                      <Mail className="size-3.5 text-slate-400" />
                      <span>{profile.email}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="size-3.5 text-cyan-400" />
                      <span>{profile.education_level || "Education not provided"}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="size-3.5 text-violet-400" />
                      <span>Target: {profile.target_role_title || "Choose a target role"}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Editable Bio Section */}
              {isEditing ? (
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Current Title</label>
                    <Input
                      value={currentTitle}
                      onChange={(e) => setCurrentTitle(e.target.value)}
                      placeholder="e.g. Software Engineer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Bio / Career Objective</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-input bg-card/60 p-3 text-xs text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button variant="gradient" size="sm" onClick={handleSaveProfile} disabled={saving} className="rounded-xl text-xs">
                      <Save className="size-3.5 mr-1.5" />
                      <span>Save Changes</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/[0.04]">
                  {profile.bio || "Final-year Computer Science student passionate about building end-to-end full stack web platforms with modern React and cloud architectures."}
                </p>
              )}

              {/* Social Links */}
              <div className="flex items-center gap-4 pt-2 border-t border-white/[0.06] text-xs">
                <a
                  href={profile.github_url || "https://github.com"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
                >
                  <svg className="size-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>GitHub Profile</span>
                </a>
                <a
                  href={profile.linkedin_url || "https://linkedin.com"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
                >
                  <svg className="size-4 fill-[#0A66C2]" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  <span>LinkedIn Profile</span>
                </a>
              </div>
            </div>

            {/* Verified Skills Management Section */}
            <div className="surface p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-emerald-400" />
                    <span>Verified Skills Portfolio ({(skills || []).length})</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Competencies recognized by the CareerBridge skill gap engine.
                  </p>
                </div>
              </div>

              {/* Add New Skill Form */}
              <form onSubmit={handleAddSkill} className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Add skill (e.g. Next.js, Redis, GraphQL)"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="flex-1 text-xs"
                />
                <select
                  value={newSkillProficiency}
                  onChange={(e) => setNewSkillProficiency(e.target.value)}
                  className="h-11 rounded-xl border border-input bg-card/60 px-3 text-xs text-white focus:outline-none focus:border-primary"
                >
                  <option value="Strong">Strong</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Familiar">Familiar</option>
                </select>
                <Button type="submit" variant="gradient" className="rounded-xl text-xs px-5">
                  <Plus className="size-4 mr-1" />
                  <span>Add Skill</span>
                </Button>
              </form>

              {/* Skills Grid with Proficiencies and Delete Option */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                {(skills || []).map((skill) => (
                  <div
                    key={skill.id}
                    className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/20 transition-all flex items-center justify-between gap-2"
                  >
                    <div>
                      <p className="text-xs font-semibold text-white">{skill.skill_name}</p>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <span className="size-1.5 rounded-full bg-emerald-400" />
                        <span>{skill.proficiency} • {skill.source}</span>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteSkill(skill.id)}
                      className="p-1.5 text-muted-foreground hover:text-rose-400 transition-colors rounded-lg"
                      title="Remove skill"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>

            </div>

          </div>
        ) : null}

      </div>
    </AppShell>
  );
}
