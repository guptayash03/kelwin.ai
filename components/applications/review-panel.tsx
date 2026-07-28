"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Eye, Check, Pencil } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import type { ScreeningQuestion } from "@/types/application";

interface ReviewPanelProps {
  applicationId: string;
  filledFields: Record<string, string> | null;
  screeningQuestions?: ScreeningQuestion[];
}

export function ReviewPanel({
  applicationId,
  filledFields,
  screeningQuestions,
}: ReviewPanelProps) {
  const { user } = useAuth();
  const [editedFields, setEditedFields] = useState<Record<string, string>>({});
  const [editingField, setEditingField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fields = filledFields || {};

  function handleFieldEdit(label: string, value: string) {
    setEditedFields((prev) => ({ ...prev, [label]: value }));
  }

  function getCurrentValue(label: string): string {
    return editedFields[label] ?? fields[label] ?? "";
  }

  async function handleConfirmSubmit() {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken(true);
      document.cookie = `__session=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

      const res = await fetch("/api/applications/confirm-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          editedFields: Object.keys(editedFields).length > 0 ? editedFields : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to confirm submission");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const fieldEntries = Object.entries(fields);

  return (
    <div className="rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900 p-5 space-y-5">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0">
          <Eye className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-green-900 dark:text-green-200">
            Review Before Submission
          </h3>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
            Review the information below. Click any field to edit it before
            submitting.
          </p>
        </div>
      </div>

      {/* Field list */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {fieldEntries.map(([label]) => (
          <div
            key={label}
            className="rounded-lg border border-border bg-card p-3"
          >
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs text-muted-foreground">{label}</Label>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() =>
                  setEditingField(editingField === label ? null : label)
                }
              >
                <Pencil className="h-3 w-3" />
              </button>
            </div>
            {editingField === label ? (
              getCurrentValue(label).length > 80 ? (
                <Textarea
                  value={getCurrentValue(label)}
                  onChange={(e) => handleFieldEdit(label, e.target.value)}
                  className="mt-1 text-sm"
                  rows={3}
                />
              ) : (
                <Input
                  value={getCurrentValue(label)}
                  onChange={(e) => handleFieldEdit(label, e.target.value)}
                  className="mt-1 text-sm"
                />
              )
            ) : (
              <p className="text-sm text-foreground">
                {getCurrentValue(label) || "—"}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Screening Questions */}
      {screeningQuestions && screeningQuestions.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-green-200 dark:border-green-900">
          <p className="text-xs font-medium text-muted-foreground">
            Screening Questions
          </p>
          {screeningQuestions.map((q) => (
            <div
              key={q.questionId}
              className="rounded-lg border border-border bg-card p-3"
            >
              <p className="text-xs text-muted-foreground mb-1">
                {q.question}
              </p>
              <p className="text-sm text-foreground">
                {q.aiGeneratedAnswer || "—"}
              </p>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <Button onClick={handleConfirmSubmit} disabled={loading}>
          <Check className="h-4 w-4" />
          {loading ? "Submitting..." : "Confirm & Submit"}
        </Button>
        {Object.keys(editedFields).length > 0 && (
          <span className="text-xs text-muted-foreground">
            {Object.keys(editedFields).length} field(s) edited
          </span>
        )}
      </div>
    </div>
  );
}
