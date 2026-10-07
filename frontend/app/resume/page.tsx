"use client";

import { useState } from "react";
import Link from "next/link";
import {
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Code,
  Award,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/navigation/app-shell";
import { Button } from "@/components/ui/button";
import { SkillChip, PanelSkeleton, ErrorState } from "@/components/shared/primitives";
import { api } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import type { ResumeAnalysis, ResumeCertification } from "@/types";

interface ResumeExperience {
  title?: string;
  duration?: string;
  company?: string;
  description?: string;
}

interface ResumeEducation {
  degree?: string;
  institution?: string;
  graduation_year?: string;
}

export default function ResumePage() {
  const { data, loading, error, reload, setData, source } = useApi<ResumeAnalysis>(() =>
    api.getLatestResume()
  );
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    setUploadProgress("Uploading and extracting resume text…");
    try {
      const res = await api.uploadResume(file);
      setData(() => res.data);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Resume upload failed.");
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const parsed = data?.parsed_data;

  return (
    <AppShell dataSource={source}>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">
              Resume Intelligence & AI Parsing
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Upload your resume in PDF or DOCX to extract verified skills, education, and career milestones.
            </p>
          </div>
        </div>
        {uploadError && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{uploadError}</p>}

        {/* Upload Dropzone */}
        <div className="surface p-8 rounded-3xl border-2 border-dashed border-white/15 hover:border-primary/50 transition-all text-center relative overflow-hidden group">
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
            }}
            disabled={uploading}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
          />

          <div className="max-w-md mx-auto space-y-3">
            <div className="size-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary mx-auto group-hover:scale-110 transition-transform">
              <UploadCloud className="size-7 text-primary" />
            </div>
            <h3 className="font-heading text-lg font-bold text-white">
              {uploading ? uploadProgress : "Drop your resume here or click to browse"}
            </h3>
            <p className="text-xs text-muted-foreground">
              Supports PDF, DOCX, and TXT files up to 10MB. Text is parsed securely and processed locally or with configured AI models.
            </p>
            {!uploading && (
              <div className="pt-2">
                <Button variant="gradient" size="sm" className="rounded-xl pointer-events-none">
                  Select Document
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="space-y-6">
            <PanelSkeleton lines={4} />
            <PanelSkeleton lines={4} />
          </div>
        ) : error && error !== "No resume uploaded" ? (
          <ErrorState message={error} onRetry={reload} />
        ) : error === "No resume uploaded" ? (
          <div className="surface rounded-2xl border border-white/10 p-6 text-sm text-muted-foreground">No resume uploaded yet. Add a PDF, DOCX, or TXT file above to start parsing.</div>
        ) : parsed ? (
          <div className="space-y-6">
            
            {/* Top Analysis Banner */}
            <div className="surface p-6 rounded-2xl border border-white/10 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="size-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="size-6" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-white">
                    Parsed: {data.filename}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Extracted {data.extracted_skills_count} canonical skills into your live profile.
                  </p>
                </div>
              </div>
              <Link href="/skill-gap">
                <Button variant="gradient" size="sm" className="rounded-xl text-xs font-semibold">
                  <span>Run Skill Gap Analysis</span>
                  <ArrowRight className="size-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>

            {/* Extracted Skills Section */}
            <div className="surface p-6 rounded-2xl border border-white/10 shadow-lg space-y-4">
              <div className="flex items-center gap-2">
                <Code className="size-4.5 text-primary" />
                <h3 className="font-heading text-base font-bold text-white">
                  Identified & Normalized Skills
                </h3>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {(parsed.skills || []).map((s, idx) => (
                  <SkillChip key={idx} name={s.name} state="strong">
                    {s.proficiency && (
                      <span className="text-[10px] opacity-70 ml-1">({s.proficiency})</span>
                    )}
                  </SkillChip>
                ))}
              </div>
            </div>

            {/* Education & Experience 2-column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Experience */}
              <div className="surface p-6 rounded-2xl border border-white/10 shadow-lg space-y-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="size-4.5 text-cyan-400" />
                  <h3 className="font-heading text-base font-bold text-white">
                    Work Experience
                  </h3>
                </div>
                <div className="space-y-4">
                  {(parsed.experience || []).map((entry, idx) => {
                    const exp = entry as ResumeExperience;
                    return (
                    <div key={idx} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-white">{exp.title || "Developer"}</h4>
                        <span className="text-[11px] text-muted-foreground">{exp.duration || "2024 - Present"}</span>
                      </div>
                      <p className="text-xs text-primary font-medium">{exp.company || "TechSolutions"}</p>
                      <p className="text-xs text-slate-300 leading-relaxed pt-1">{exp.description}</p>
                    </div>
                    );
                  })}
                </div>
              </div>

              {/* Education & Projects */}
              <div className="space-y-6">
                {/* Education */}
                <div className="surface p-6 rounded-2xl border border-white/10 shadow-lg space-y-4">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="size-4.5 text-violet-400" />
                    <h3 className="font-heading text-base font-bold text-white">
                      Education
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {(parsed.education || []).map((entry, idx) => {
                      const edu = entry as ResumeEducation;
                      return (
                      <div key={idx} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                        <h4 className="text-sm font-semibold text-white">{edu.degree || "B.S. in Computer Science"}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{edu.institution || "Engineering College"}</p>
                        {edu.graduation_year && <span className="text-[11px] text-primary">{edu.graduation_year}</span>}
                      </div>
                      );
                    })}
                  </div>
                </div>

                {/* Certifications with Credibility & Legitimacy Scoring */}
                <div className="surface p-6 rounded-2xl border border-white/10 shadow-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="size-4.5 text-amber-400" />
                      <h3 className="font-heading text-base font-bold text-white">
                        Certifications & Legitimacy
                      </h3>
                    </div>
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {(parsed.certifications || []).length} Detected
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Certifications from accredited bodies (AWS, Google, Microsoft, CNCF, Cisco, CompTIA, Meta) are verified and prioritized. Low-priority or attendance certificates are scored accordingly.
                  </p>

                  <div className="space-y-3">
                    {(parsed.certifications || []).map((cert, idx) => {
                      const isObj = typeof cert === "object" && cert !== null;
                      const cObj = isObj ? (cert as ResumeCertification) : null;
                      const certName = cObj ? cObj.name : String(cert);
                      const issuer = cObj?.issuer || "Independent Issuer";
                      const score = cObj?.credibility_score ?? 70;
                      const priority = cObj?.priority_level ?? (score >= 85 ? "High" : score >= 60 ? "Medium" : "Low");
                      const notes = cObj?.reputation_notes;
                      const skills = cObj?.skills_validated || [];

                      const isHigh = score >= 85;
                      const isMed = score >= 60 && score < 85;

                      return (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-xl border transition-all ${
                            isHigh
                              ? "bg-emerald-950/20 border-emerald-500/30"
                              : isMed
                              ? "bg-sky-950/20 border-sky-500/30"
                              : "bg-zinc-900/40 border-white/10"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                {isHigh ? (
                                  <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
                                ) : isMed ? (
                                  <CheckCircle2 className="size-4 text-sky-400 shrink-0" />
                                ) : (
                                  <ShieldAlert className="size-4 text-amber-400 shrink-0" />
                                )}
                                <h4 className="text-xs sm:text-sm font-semibold text-white">{certName}</h4>
                                {cObj?.year && (
                                  <span className="text-[10px] text-muted-foreground font-mono">({cObj.year})</span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-300 font-medium">
                                Issuer: <span className="text-white font-semibold">{issuer}</span>
                              </p>
                            </div>

                            {/* Credibility Score Badge */}
                            <div className="text-right shrink-0">
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  isHigh
                                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                    : isMed
                                    ? "bg-sky-500/15 text-sky-300 border-sky-500/30"
                                    : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                }`}
                              >
                                {score}/100 · {priority} Priority
                              </span>
                            </div>
                          </div>

                          {/* Reputation & AI note */}
                          {notes && (
                            <p className="text-[11px] text-slate-300 mt-2 leading-relaxed bg-black/25 p-2 rounded-lg border border-white/5">
                              {notes}
                            </p>
                          )}

                          {/* Validated Skills */}
                          {skills.length > 0 && (
                            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                Validated Skills:
                              </span>
                              {skills.map((s) => (
                                <span
                                  key={s}
                                  className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-cyan-300 font-medium"
                                >
                                  ✓ {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>

          </div>
        ) : null}

      </div>
    </AppShell>
  );
}
