"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useApplication } from "@/hooks/use-application";
import { ApplicationTimeline } from "@/components/applications/application-timeline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { application, loading, error } = useApplication(params.id);

  async function handleRetry() {
    if (!user || !application) return;
    try {
      const token = await user.getIdToken(true);
      document.cookie = `__session=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

      await fetch("/api/applications/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: application.id }),
      });
    } catch (err) {
      console.error("Retry failed:", err);
    }
  }

  async function handleResumeApply() {
    if (!user || !application) return;
    try {
      const token = await user.getIdToken(true);
      document.cookie = `__session=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

      await fetch("/api/applications/resume-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: application.id }),
      });
    } catch (err) {
      console.error("Resume apply failed:", err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/applications"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Applications
        </Link>
        <p className="text-muted-foreground">Application not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link
          href="/dashboard/applications"
          className="hover:text-foreground transition-colors"
        >
          Applications
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium truncate max-w-75">
          {application.jobTitle}
        </span>
      </nav>

      {/* Header Card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          {/* Company Logo */}
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border bg-white flex items-center justify-center">
            {application.companyLogo ? (
              <img
                src={application.companyLogo}
                alt={application.company}
                className="h-8 w-8 object-contain"
                onError={(e) => {
                  const el = e.target as HTMLImageElement;
                  el.style.display = "none";
                  el.parentElement!.innerHTML = `<span class="text-lg font-bold text-muted-foreground">${application.company.charAt(0)}</span>`;
                }}
              />
            ) : (
              <span className="text-lg font-bold text-muted-foreground">
                {application.company.charAt(0)}
              </span>
            )}
          </div>

          {/* Title & Company */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-foreground">
              {application.jobTitle}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {application.company}
            </p>
          </div>

          {/* Status */}
          {application.status === "applied" && (
            <Badge variant="default" className="gap-1 bg-green-600">
              <CheckCircle2 className="h-3 w-3" />
              Applied
            </Badge>
          )}
          {application.status === "failed" && (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              Failed
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border">
          <a
            href={application.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4" />
              View Job
            </Button>
          </a>
          {application.status === "failed" && (
            <Button variant="default" size="sm" onClick={handleRetry}>
              <RefreshCw className="h-4 w-4" />
              Retry Application
            </Button>
          )}
          {application.status === "missing_profile_info" && (
            <Button variant="default" size="sm" onClick={handleResumeApply}>
              Resume Application
            </Button>
          )}
          {application.confirmationUrl && (
            <a
              href={application.confirmationUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm">
                View Confirmation
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">
              Progress
            </h2>
            <ApplicationTimeline
              currentStatus={application.status}
              failureReason={application.failureReason}
              missingFields={application.missingFields}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Details */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <h2 className="text-base font-semibold text-foreground">Details</h2>
            <DetailRow label="Platform" value={application.platform} />
            <DetailRow label="Status" value={application.status.replace(/_/g, " ")} />
            <DetailRow label="Retry Count" value={String(application.retryCount)} />
            {application.submittedAt != null && (
              <DetailRow label="Submitted" value="Yes" />
            )}
          </div>

          {/* Missing Fields Alert */}
          {application.status === "missing_profile_info" &&
            application.missingFields.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 space-y-3">
                <h2 className="text-base font-semibold text-amber-800">
                  Missing Profile Info
                </h2>
                <ul className="space-y-1">
                  {application.missingFields.map((field) => (
                    <li
                      key={field}
                      className="text-xs text-amber-700 flex items-center gap-1"
                    >
                      <AlertCircle className="h-3 w-3" />
                      {field}
                    </li>
                  ))}
                </ul>
                <Link href="/dashboard/profile">
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    Complete Profile
                  </Button>
                </Link>
              </div>
            )}

          {/* Confirmation */}
          {application.confirmationMessage && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-6">
              <h2 className="text-base font-semibold text-green-800 mb-2">
                Confirmation
              </h2>
              <p className="text-xs text-green-700">
                {application.confirmationMessage}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium text-foreground capitalize">
        {value}
      </span>
    </div>
  );
}
