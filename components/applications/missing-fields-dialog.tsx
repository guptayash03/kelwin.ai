"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";

interface MissingFieldsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
  missingFields: string[];
  jobTitle: string;
  company: string;
  onComplete: () => void;
}

export function MissingFieldsDialog({
  open,
  onOpenChange,
  applicationId,
  missingFields,
  jobTitle,
  company,
  onComplete,
}: MissingFieldsDialogProps) {
  const { user } = useAuth();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loadingField, setLoadingField] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleAnswerWithAI(fieldLabel: string) {
    if (!user) return;
    setLoadingField(fieldLabel);

    try {
      const token = await user.getIdToken(true);
      document.cookie = `__session=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

      const res = await fetch("/api/applications/answer-field", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, fieldLabel }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate answer");
      }

      const { answer } = await res.json();
      setAnswers((prev) => ({ ...prev, [fieldLabel]: answer }));
    } catch (err) {
      console.error("AI answer failed:", err);
    } finally {
      setLoadingField(null);
    }
  }

  async function handleSubmit() {
    if (!user) return;

    const unanswered = missingFields.filter((f) => !answers[f]?.trim());
    if (unanswered.length > 0) return;

    setSubmitting(true);
    try {
      const token = await user.getIdToken(true);
      document.cookie = `__session=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

      const res = await fetch("/api/applications/complete-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, answers }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }

      onComplete();
      onOpenChange(false);
    } catch (err) {
      console.error("Submit failed:", err);
    } finally {
      setSubmitting(false);
    }
  }

  const allAnswered = missingFields.every((f) => answers[f]?.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Missing Information</DialogTitle>
          <DialogDescription>
            The application for <span className="font-medium">{jobTitle}</span> at{" "}
            <span className="font-medium">{company}</span> requires additional information.
            Fill in the fields below or use AI to generate answers from your profile.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {missingFields.map((field) => (
            <div key={field} className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {field}
              </label>
              <div className="flex gap-2">
                <Input
                  value={answers[field] || ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [field]: e.target.value }))
                  }
                  placeholder={`Enter ${field.toLowerCase()}`}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAnswerWithAI(field)}
                  disabled={loadingField === field}
                  className="shrink-0 gap-1.5"
                >
                  {loadingField === field ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : answers[field] ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  AI
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Resuming...
              </>
            ) : (
              "Continue Application"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
