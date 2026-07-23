"use client";

import type { ParsedResumeData } from "@/types/resume";
import {
  User,
  Briefcase,
  GraduationCap,
  Code,
  FolderOpen,
  Award,
  CheckCircle2,
  Circle,
} from "lucide-react";

interface ProfileCompletenessProps {
  data: ParsedResumeData;
}

interface Section {
  label: string;
  icon: typeof User;
  filled: boolean;
}

function calculateSections(data: ParsedResumeData): Section[] {
  const { personalInfo, skills } = data;

  const hasContact = !!(personalInfo.email || personalInfo.phone);
  const hasSummary = !!data.professionalSummary;
  const hasExperience = data.experience.length > 0;
  const hasEducation = data.education.length > 0;
  const hasSkills =
    skills.technical.length > 0 ||
    skills.frameworks.length > 0 ||
    skills.languages.length > 0 ||
    skills.tools.length > 0;
  const hasProjects = data.projects.length > 0;
  const hasCertifications = data.certifications.length > 0;
  const hasLinks = !!(personalInfo.linkedIn || personalInfo.github || personalInfo.portfolio);

  return [
    { label: "Contact Info", icon: User, filled: hasContact },
    { label: "Summary", icon: User, filled: hasSummary },
    { label: "Experience", icon: Briefcase, filled: hasExperience },
    { label: "Education", icon: GraduationCap, filled: hasEducation },
    { label: "Skills", icon: Code, filled: hasSkills },
    { label: "Projects", icon: FolderOpen, filled: hasProjects },
    { label: "Certifications", icon: Award, filled: hasCertifications },
    { label: "Social Links", icon: User, filled: hasLinks },
  ];
}

function getProgressColor(percentage: number): string {
  if (percentage >= 80) return "text-green-500";
  if (percentage >= 60) return "text-blue-500";
  if (percentage >= 40) return "text-amber-500";
  return "text-red-500";
}

function getProgressStroke(percentage: number): string {
  if (percentage >= 80) return "stroke-green-500";
  if (percentage >= 60) return "stroke-blue-500";
  if (percentage >= 40) return "stroke-amber-500";
  return "stroke-red-500";
}

function getProgressBg(percentage: number): string {
  if (percentage >= 80) return "bg-green-500/10";
  if (percentage >= 60) return "bg-blue-500/10";
  if (percentage >= 40) return "bg-amber-500/10";
  return "bg-red-500/10";
}

export function ProfileCompleteness({ data }: ProfileCompletenessProps) {
  const sections = calculateSections(data);
  const filledCount = sections.filter((s) => s.filled).length;
  const percentage = Math.round((filledCount / sections.length) * 100);
  const colorClass = getProgressColor(percentage);
  const strokeClass = getProgressStroke(percentage);
  const bgClass = getProgressBg(percentage);

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="space-y-4">
      {/* Circular Progress Card */}
      <div className={`rounded-xl border border-border bg-card p-6 space-y-5`}>
        <h4 className="text-sm font-semibold text-foreground">Profile Completeness</h4>

        <div className="flex justify-center">
          <div className="relative h-32 w-32">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                strokeWidth="6"
                className="stroke-muted"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={`${strokeClass} transition-all duration-700 ease-out`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold ${colorClass}`}>{percentage}%</span>
              <span className="text-xs text-muted-foreground">Complete</span>
            </div>
          </div>
        </div>

        <div className={`rounded-lg ${bgClass} px-3 py-2 text-center`}>
          <p className={`text-xs font-medium ${colorClass}`}>
            {percentage >= 80
              ? "Great job! Profile is looking strong."
              : percentage >= 60
              ? "Good progress. Add more to stand out."
              : percentage >= 40
              ? "Getting there. Fill in missing sections."
              : "Just getting started. Keep going!"}
          </p>
        </div>
      </div>

      {/* Section Checklist */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Sections</h4>
        <div className="space-y-2.5">
          {sections.map((section) => (
            <div key={section.label} className="flex items-center gap-2.5">
              {section.filled ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
              )}
              <span
                className={`text-sm ${
                  section.filled ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {section.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
