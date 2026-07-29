"use client";

import type { ApplicationStatus } from "@/types/application";
import {
  Clock,
  Search,
  ScanLine,
  UserCheck,
  AlertTriangle,
  KeyRound,
  ShieldCheck,
  Rocket,
  Upload,
  Sparkles,
  Eye,
  Send,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface TimelineStep {
  status: ApplicationStatus;
  label: string;
  icon: React.ReactNode;
}

const TIMELINE_STEPS: TimelineStep[] = [
  { status: "queued", label: "Queued", icon: <Clock className="h-4 w-4" /> },
  { status: "detecting_platform", label: "Detecting Platform", icon: <Search className="h-4 w-4" /> },
  { status: "analyzing_application", label: "Analyzing Application", icon: <ScanLine className="h-4 w-4" /> },
  { status: "comparing_profile", label: "Comparing Profile", icon: <UserCheck className="h-4 w-4" /> },
  { status: "waiting_for_credentials", label: "Credentials Needed", icon: <KeyRound className="h-4 w-4" /> },
  { status: "ready_to_apply", label: "Ready to Apply", icon: <Rocket className="h-4 w-4" /> },
  { status: "applying", label: "Applying", icon: <Rocket className="h-4 w-4" /> },
  { status: "waiting_for_otp", label: "OTP Required", icon: <ShieldCheck className="h-4 w-4" /> },
  { status: "uploading_resume", label: "Uploading Resume", icon: <Upload className="h-4 w-4" /> },
  { status: "generating_ai_answers", label: "Generating AI Answers", icon: <Sparkles className="h-4 w-4" /> },
  { status: "waiting_for_review", label: "Review & Confirm", icon: <Eye className="h-4 w-4" /> },
  { status: "submitting", label: "Submitting", icon: <Send className="h-4 w-4" /> },
  { status: "applied", label: "Applied", icon: <CheckCircle2 className="h-4 w-4" /> },
];

const STATUS_ORDER: ApplicationStatus[] = TIMELINE_STEPS.map((s) => s.status);

const WAITING_STATUS_SET: Set<ApplicationStatus> = new Set([
  "missing_profile_info",
  "waiting_for_credentials",
  "waiting_for_otp",
  "waiting_for_review",
]);

function getStepState(
  stepStatus: ApplicationStatus,
  currentStatus: ApplicationStatus
): "completed" | "active" | "upcoming" | "error" | "warning" {
  if (currentStatus === "failed") {
    const currentIndex = STATUS_ORDER.indexOf(stepStatus);
    const failedAt = STATUS_ORDER.indexOf(currentStatus);
    if (currentIndex < failedAt) return "completed";
    if (currentIndex === failedAt) return "error";
    return "upcoming";
  }
  if (currentStatus === "missing_profile_info") {
    if (stepStatus === "comparing_profile") return "warning";
    const currentIndex = STATUS_ORDER.indexOf(stepStatus);
    const compIdx = STATUS_ORDER.indexOf("comparing_profile");
    if (currentIndex < compIdx) return "completed";
    return "upcoming";
  }
  if (WAITING_STATUS_SET.has(currentStatus)) {
    if (stepStatus === currentStatus) return "warning";
    const stepIndex = STATUS_ORDER.indexOf(stepStatus);
    const currentIndex = STATUS_ORDER.indexOf(currentStatus);
    if (stepIndex < currentIndex) return "completed";
    return "upcoming";
  }

  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const stepIndex = STATUS_ORDER.indexOf(stepStatus);

  if (stepIndex < currentIndex) return "completed";
  if (stepIndex === currentIndex) return "active";
  return "upcoming";
}

interface ApplicationTimelineProps {
  currentStatus: ApplicationStatus;
  failureReason?: string | null;
  missingFields?: string[];
}

export function ApplicationTimeline({
  currentStatus,
  failureReason,
  missingFields,
}: ApplicationTimelineProps) {
  return (
    <div className="space-y-1">
      {TIMELINE_STEPS.map((step, i) => {
        const state = getStepState(step.status, currentStatus);
        const isLast = i === TIMELINE_STEPS.length - 1;

        return (
          <div key={step.status} className="flex gap-3">
            {/* Connector + Icon */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  state === "completed"
                    ? "bg-green-100 text-green-600"
                    : state === "active"
                      ? "bg-primary/10 text-primary ring-2 ring-primary/20"
                      : state === "error"
                        ? "bg-red-100 text-red-600"
                        : state === "warning"
                          ? "bg-amber-100 text-amber-600"
                          : "bg-muted text-muted-foreground"
                }`}
              >
                {state === "error" ? (
                  <XCircle className="h-4 w-4" />
                ) : state === "warning" ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  step.icon
                )}
              </div>
              {!isLast && (
                <div
                  className={`w-px flex-1 min-h-4 ${
                    state === "completed" ? "bg-green-300" : "bg-border"
                  }`}
                />
              )}
            </div>

            {/* Label */}
            <div className="flex flex-col justify-center pb-4">
              <p
                className={`text-sm ${
                  state === "active"
                    ? "font-medium text-foreground"
                    : state === "completed"
                      ? "text-muted-foreground"
                      : state === "error"
                        ? "font-medium text-red-600"
                        : state === "warning"
                          ? "font-medium text-amber-600"
                          : "text-muted-foreground/60"
                }`}
              >
                {step.label}
                {state === "active" && (
                  <span className="ml-2 inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
                )}
              </p>
              {state === "error" && failureReason && (
                <p className="text-xs text-red-500 mt-0.5">{failureReason}</p>
              )}
              {state === "warning" && missingFields && missingFields.length > 0 && (
                <p className="text-xs text-amber-500 mt-0.5">
                  Missing: {missingFields.join(", ")}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
