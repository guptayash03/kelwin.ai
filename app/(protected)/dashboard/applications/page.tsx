"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useApplications } from "@/hooks/use-applications";
import { ApplicationCard } from "@/components/applications/application-card";
import { Button } from "@/components/ui/button";
import { Briefcase, CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

type Filter = "all" | "active" | "queued" | "applied" | "failed";

export default function ApplicationsPage() {
  const { user } = useAuth();
  const { applications, loading, activeCount, queuedCount, appliedCount, failedCount } =
    useApplications();
  const [filter, setFilter] = useState<Filter>("all");
  const [retrying, setRetrying] = useState<string | null>(null);

  const filtered = applications.filter((app) => {
    switch (filter) {
      case "active":
        return ![
          "queued",
          "applied",
          "failed",
          "missing_profile_info",
        ].includes(app.status);
      case "queued":
        return app.status === "queued";
      case "applied":
        return app.status === "applied";
      case "failed":
        return app.status === "failed";
      default:
        return true;
    }
  });

  async function handleRetry(applicationId: string) {
    if (!user) return;
    setRetrying(applicationId);
    try {
      const token = await user.getIdToken(true);
      document.cookie = `__session=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

      await fetch("/api/applications/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      });
    } catch (err) {
      console.error("Retry failed:", err);
    } finally {
      setRetrying(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Applications</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Track your AI-assisted job applications.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={<Loader2 className="h-4 w-4 text-primary" />}
          label="In Progress"
          value={activeCount}
        />
        <StatCard
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          label="Queued"
          value={queuedCount}
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4 text-green-600" />}
          label="Applied"
          value={appliedCount}
        />
        <StatCard
          icon={<AlertCircle className="h-4 w-4 text-red-600" />}
          label="Failed"
          value={failedCount}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 rounded-lg border border-border p-0.5 w-fit">
        {(["all", "active", "queued", "applied", "failed"] as Filter[]).map(
          (f) => (
            <Button
              key={f}
              variant={filter === f ? "secondary" : "ghost"}
              size="xs"
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f}
            </Button>
          )
        )}
      </div>

      {/* Applications List */}
      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              onRetry={handleRetry}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
            <Briefcase className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">
            {filter === "all"
              ? "No applications yet"
              : `No ${filter} applications`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {filter === "all"
              ? "Use Easy Apply on any job to get started."
              : "Try a different filter."}
          </p>
          {filter === "all" && (
            <Link href="/dashboard/jobs">
              <Button variant="default" size="sm" className="mt-4">
                Browse Jobs
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-semibold text-foreground mt-1">{value}</p>
    </div>
  );
}
