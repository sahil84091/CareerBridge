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
import type { Profile, UserSkillItem, ProfileEnhancementResponse } from "@/types";

export default function ProfilePage() {
  const { data: profile, loading, error, reload: reloadProfile, source } = useApi<Profile>(() =>
    api.getProfile()
  );
  const { data: skills, reload: reloadSkills } = useApi<UserSkillItem[]>(() =>
    api.getUserSkills()
  );
  const {
    data: enhancements,
    loading: loadingEnhancements,
    reload: reloadEnhancements,
  } = useApi<ProfileEnhancementResponse>(() => api.getProfileEnhancements());

  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(profile?.bio || "");
  const [currentTitle, setCurrentTitle] = useState(profile?.current_title || "");
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillProficiency, setNewSkillProficiency] = useState("Moderate");
  const [githubInput, setGithubInput] = useState("");
  const [linkedinInput, setLinkedinInput] = useState("");
  const [syncingGitHub, setSyncingGitHub] = useState(false);
  const [syncingLinkedIn, setSyncingLinkedIn] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleSyncGitHub = async (targetUrlOrUser?: string) => {
    const val = targetUrlOrUser || githubInput;
    if (!val.trim()) return;
    setSyncingGitHub(true);
    setActionError(null);
    try {
      await api.linkGitHub(val.trim());
      setGithubInput("");
      reloadProfile();
      reloadSkills();
      reloadEnhancements();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to sync GitHub account.");
    } finally {
      setSyncingGitHub(false);
    }
  };

  const handleUnlinkGitHub = async () => {
    try {
      setActionError(null);
      await api.unlinkGitHub();
      reloadProfile();
      reloadEnhancements();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to unlink GitHub account.");
    }
  };

  const handleSyncLinkedIn = async (targetUrlOrUser?: string) => {
    const val = targetUrlOrUser || linkedinInput;
    if (!val.trim()) return;
    setSyncingLinkedIn(true);
    setActionError(null);
    try {
      await api.linkLinkedIn({ linkedin_url: val.trim() });
      setLinkedinInput("");
      reloadProfile();
      reloadSkills();
      reloadEnhancements();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to sync LinkedIn account.");
    } finally {
      setSyncingLinkedIn(false);
    }
  };

  const handleUnlinkLinkedIn = async () => {
    try {
      setActionError(null);
      await api.unlinkLinkedIn();
      reloadProfile();
      reloadEnhancements();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to unlink LinkedIn account.");
    }
  };


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
                <div className="size-20 rounded-2xl bg-brand p-1 shadow-lg ring-2 ring-primary/40 overflow-hidden flex-shrink-0">
                  {profile.github_data?.avatar_url || profile.linkedin_data?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.github_data?.avatar_url || profile.linkedin_data?.avatar_url || ""}
                      alt={profile.full_name || "Profile"}
                      className="size-full rounded-xl object-cover"
                    />
                  ) : (
                    <div className="size-full rounded-xl bg-[#090D1E] flex items-center justify-center font-bold text-2xl text-white">
                      {profile.full_name ? profile.full_name.trim().charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-heading text-2xl font-bold text-white">
                      {profile.full_name || "Your Profile"}
                    </h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/20 text-blue-200 border border-primary/30 font-semibold">
                      {profile.experience_level || "Not specified"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 font-medium">
                    {profile.current_title || profile.linkedin_data?.headline || "Add your current title or job"}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1.5">
                      <Mail className="size-3.5 text-slate-400" />
                      <span>{profile.email}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="size-3.5 text-cyan-400" />
                      <span>{profile.education_level || "Not specified"}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="size-3.5 text-violet-400" />
                      <span>Target: {profile.target_role_title || "Select Target Role"}</span>
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
                      placeholder="Describe your background, technical interests, and goals..."
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
                  {profile.bio || profile.linkedin_data?.summary || profile.github_data?.bio || "No bio added yet. Click 'Edit Profile' to add your summary or connect your LinkedIn / GitHub to sync automatically."}
                </p>
              )}

              {/* Connected Accounts & Social Sync */}
              <div className="pt-2 border-t border-white/[0.06] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Linked Profiles</h3>
                    <p className="text-xs text-muted-foreground">Sync public code repositories and professional competencies to unlock AI personalization.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* GitHub Card */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="size-5 fill-current text-white" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                        <span className="text-xs font-semibold text-white">GitHub Account</span>
                      </div>
                      {profile.github_data ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Connected</span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">Not linked</span>
                      )}
                    </div>

                    {profile.github_data ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-medium">@{profile.github_data.username}</span>
                          <span className="text-muted-foreground">{profile.github_data.public_repos ?? 0} repos • {profile.github_data.followers ?? 0} followers</span>
                        </div>
                        {profile.github_data.languages && profile.github_data.languages.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {profile.github_data.languages.map((lang) => (
                              <span key={lang} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10">{lang}</span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSyncGitHub(profile.github_url || `https://github.com/${profile.github_data?.username}`)}
                            disabled={syncingGitHub}
                            className="text-[11px] h-7 px-3 rounded-lg border-white/10"
                          >
                            {syncingGitHub ? "Syncing..." : "Re-sync Repos"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleUnlinkGitHub}
                            className="text-[11px] h-7 px-3 rounded-lg border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
                          >
                            Unlink
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Input
                          placeholder="GitHub profile URL or username (e.g. torvalds)"
                          value={githubInput}
                          onChange={(e) => setGithubInput(e.target.value)}
                          className="text-xs h-9"
                        />
                        <Button
                          variant="gradient"
                          size="sm"
                          onClick={() => handleSyncGitHub(githubInput)}
                          disabled={syncingGitHub || !githubInput.trim()}
                          className="w-full text-xs h-8 rounded-lg"
                        >
                          {syncingGitHub ? "Syncing..." : "Connect GitHub"}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* LinkedIn Card */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="size-5 fill-[#0A66C2]" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                        <span className="text-xs font-semibold text-white">LinkedIn Profile</span>
                      </div>
                      {profile.linkedin_data ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Connected</span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">Not linked</span>
                      )}
                    </div>

                    {profile.linkedin_data ? (
                      <div className="space-y-2">
                        <div className="text-xs text-slate-300 font-medium">in/{profile.linkedin_data.handle}</div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2">{profile.linkedin_data.headline}</p>
                        {profile.linkedin_data.detected_skills && profile.linkedin_data.detected_skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {profile.linkedin_data.detected_skills.slice(0, 4).map((sk) => (
                              <span key={sk} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10">{sk}</span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleUnlinkLinkedIn}
                            className="text-[11px] h-7 px-3 rounded-lg border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
                          >
                            Unlink
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Input
                          placeholder="LinkedIn URL or handle (e.g. linkedin.com/in/johndoe)"
                          value={linkedinInput}
                          onChange={(e) => setLinkedinInput(e.target.value)}
                          className="text-xs h-9"
                        />
                        <Button
                          variant="gradient"
                          size="sm"
                          onClick={() => handleSyncLinkedIn(linkedinInput)}
                          disabled={syncingLinkedIn || !linkedinInput.trim()}
                          className="w-full text-xs h-8 rounded-lg"
                        >
                          {syncingLinkedIn ? "Syncing..." : "Connect LinkedIn"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Resume & Project Suggestions Section */}
            <div className="surface p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                    <span className="size-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span>AI Resume & Project Recommendations</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Tailored project ideas, high-impact bullet points, and personalized roles based on your connected GitHub & LinkedIn activity.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={reloadEnhancements}
                  disabled={loadingEnhancements}
                  className="rounded-xl border-white/10 hover:bg-white/5 text-xs text-slate-300"
                >
                  {loadingEnhancements ? "Generating..." : "Refresh Recommendations"}
                </Button>
              </div>

              {enhancements && (
                <div className="space-y-6">
                  {/* Recommended Projects to Add to Resume */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                      High-Impact Portfolio Projects to Build
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {enhancements.project_suggestions.map((proj, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 transition-all space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="text-sm font-bold text-white">{proj.title}</h5>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 whitespace-nowrap">
                              {proj.recommended_action}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300">{proj.description}</p>
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase">Quantifiable Bullet Points:</span>
                            {proj.impact_bullet_points.map((bp, bidx) => (
                              <div key={bidx} className="text-xs text-slate-300 flex items-start gap-1.5 bg-black/20 p-2 rounded-lg border border-white/5">
                                <span className="text-cyan-400 font-bold">•</span>
                                <span>{bp}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {proj.target_skills.map((ts) => (
                              <span key={ts} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/5">{ts}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resume Accomplishment Bullets */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                      Resume-Ready Impact Highlights
                    </h4>
                    <div className="space-y-2">
                      {enhancements.resume_enhancements.map((bullet, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-200 flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span className="leading-relaxed">{bullet}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Personalized Roles */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                      Recommended Role Targets
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {enhancements.personalized_roles.map((role, idx) => (
                        <span key={idx} className="text-xs px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-blue-200 font-medium">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
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

