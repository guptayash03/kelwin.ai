"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import type { CentralJob } from "@/types/central-job";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Sparkles, ExternalLink, Loader2, CheckCircle2 } from "lucide-react";

interface ApplyDialogProps {
  job: CentralJob | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApplyDialog({ job, open, onOpenChange }: ApplyDialogProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setState("idle");
      setApplicationId(null);
      setErrorMessage(null);
    }
    onOpenChange(nextOpen);
  }

  async function handleEasyApply() {
    if (!job || !user) return;

    setState("loading");
    setErrorMessage(null);

    try {
      const token = await user.getIdToken(true);
      document.cookie = `__session=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

      const response = await fetch("/api/applications/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          jobUrl: job.url,
          jobTitle: job.title,
          company: job.organization,
          companyLogo: job.organizationLogo || "",
          platform: job.source,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create application");
      }

      const data = await response.json();
      setApplicationId(data.applicationId);
      setState("success");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }

  function handleManualApply() {
    if (!job) return;
    window.open(job.url, "_blank", "noopener,noreferrer");
    onOpenChange(false);
  }

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Apply to {job.organization}</DialogTitle>
          <DialogDescription>{job.title}</DialogDescription>
        </DialogHeader>

        {state === "idle" && (
          <div className="grid grid-cols-1 gap-3 pt-2">
            <button
              onClick={handleEasyApply}
              className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-left transition-colors hover:bg-primary/10"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Easy Apply with AI
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Automatically complete and submit the application
                </p>
              </div>
            </button>

            <button
              onClick={handleManualApply}
              className="flex items-start gap-3 rounded-xl border border-border p-4 text-left transition-colors hover:bg-muted/50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <ExternalLink className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Apply Manually
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Open the original application page
                </p>
              </div>
            </button>
          </div>
        )}

        {state === "loading" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Creating application...
            </p>
          </div>
        )}

        {state === "success" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Application Queued
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                AI will analyze and submit your application automatically.
              </p>
            </div>
            <Button
              variant="default"
              size="sm"
              className="mt-2"
              onClick={() => {
                onOpenChange(false);
                router.push(`/dashboard/applications/${applicationId}`);
              }}
            >
              Track Progress
            </Button>
          </div>
        )}

        {state === "error" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <p className="text-sm text-destructive">{errorMessage}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setState("idle")}>
                Try Again
              </Button>
              <Button variant="ghost" size="sm" onClick={handleManualApply}>
                Apply Manually
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
