"use client";

import { motion } from "framer-motion";
import { CheckCircle, Briefcase, GraduationCap, Code } from "lucide-react";
import type { ParsedResumeData } from "@/types/resume";

interface OnboardingSuccessProps {
  data: ParsedResumeData;
  onContinue: () => void;
  onReplace: () => void;
  loading?: boolean;
}

export function OnboardingSuccess({
  data,
  onContinue,
  onReplace,
  loading,
}: OnboardingSuccessProps) {
  const skillsCount =
    data.skills.technical.length +
    data.skills.frameworks.length +
    data.skills.languages.length +
    data.skills.tools.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle className="h-5 w-5 text-green-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            Resume parsed successfully
          </p>
          <p className="text-xs text-muted-foreground">
            We extracted your profile information
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          {data.personalInfo.fullName}
        </h3>
        {data.professionalSummary && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {data.professionalSummary}
          </p>
        )}

        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">
              {data.experience.length} roles
            </span>
          </div>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">
              {data.education.length} degrees
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">
              {skillsCount} skills
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={onContinue}
          disabled={loading}
          className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Saving...
            </span>
          ) : (
            "Continue to Dashboard"
          )}
        </button>
        <button
          onClick={onReplace}
          disabled={loading}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Replace resume
        </button>
      </div>
    </motion.div>
  );
}
