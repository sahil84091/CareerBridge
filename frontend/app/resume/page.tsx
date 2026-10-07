"use client";

import { useState } from "react";
import Link from "next/link";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Code,
  Award,
  Layers,
  RefreshCw,
} from "lucide-react";
import { AppShell } from "@/components/navigation/app-shell";
import { Button } from "@/components/ui/button";
import { SkillChip, PanelSkeleton, ErrorState } from "@/components/shared/primitives";
import { api } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import type { ResumeAnalysis } from "@/types";

interface ResumeExperience {
  title?: string;
  duration?: string;
  company?: string;
  description?: string;
}

interface ResumeEducation {
  degree?: string;
  institution?: string;
  year?: string;
}

export default function ResumePage() {
  const { data, loading, error, reload, setData, source } = useApi<ResumeAnalysis>(() =>
    api.getLatestResume()
  );
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadProgress("Extracting text from resume...");
    try {
      setTimeout(() => setUploadProgress("Running AI skill extraction..."), 600);
      setTimeout(() => setUploadProgress("Normalizing canonical taxonomy..."), 1200);
      const res = await api.uploadResume(file);
      setTimeout(() => {
        setData(() => res.data);
        setUploading(false);
        setUploadProgress(null);
      }, 1600);
    } catch (e) {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const handleLoadSample = async () => {
    setUploading(true);
    setUploadProgress("Loading sample candidate resume...");
    setTimeout(() => {
      reload();
      setUploading(false);
      setUploadProgress(null);
    }, 800);
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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadSample}
              disabled={uploading}
              className="rounded-xl border-white/10 hover:bg-white/5 text-xs text-slate-300"
            >
              <Sparkles className="size-3.5 mr-1.5 text-cyan-400" />
              <span>Load Sample Resume</span>
            </Button>
          </div>
        </div>

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
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
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
                    Parsed: {data.filename || "demo_resume.pdf"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Extracted {data.extracted_skills_count || parsed.skills?.length || 12} canonical skills into your live profile.
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
                        {edu.year && <span className="text-[11px] text-primary">{edu.year}</span>}
                      </div>
                      );
                    })}
                  </div>
                </div>

                {/* Certifications */}
                <div className="surface p-6 rounded-2xl border border-white/10 shadow-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <Award className="size-4.5 text-amber-400" />
                    <h3 className="font-heading text-base font-bold text-white">
                      Certifications
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {(parsed.certifications || ["Meta Front-End Developer Certificate", "Google Cloud Essentials"]).map((cert, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-slate-200">
                        <CheckCircle2 className="size-3.5 text-emerald-400" />
                        <span>{cert}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>

          </div>
        ) : null}

      </div>
    </AppShell>
  );
}
