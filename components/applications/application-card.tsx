"use client";

import { useRouter } from "next/navigation";
import type { ApplicationDocument, ApplicationStatus } from "@/types/application";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, CheckCircle2, Clock, Loader2, FileQuestion } from "lucide-react";
import { ACTIVE_STATUSES } from "@/types/application";

function getStatusConfig(status: ApplicationStatus) {
  if (status === "applied") {
    return { label: "Applied", variant: "default" as const, icon: CheckCircle2, color: "text-green-600" };
  }
  if (status === "failed") {
    return { label: "Failed", variant: "destructive" as const, icon: AlertCircle, color: "text-red-600" };
  }
  if (status === "queued") {
    return { label: "Queued", variant: "secondary" as const, icon: Clock, color: "text-muted-foreground" };
  }
  if (status === "missing_profile_info") {
    return { label: "Missing Info", variant: "outline" as const, icon: AlertCircle, color: "text-amber-600" };
  }
  return { label: "In Progress", variant: "outline" as const, icon: Loader2, color: "text-primary" };
}

interface ApplicationCardProps {
  application: ApplicationDocument & { id: string };
  onRetry?: (id: string) => void;
  onCompleteMissing?: (application: ApplicationDocument & { id: string }) => void;
}

export function ApplicationCard({ application, onRetry, onCompleteMissing }: ApplicationCardProps) {
  const router = useRouter();
  const statusConfig = getStatusConfig(application.status);
  const StatusIcon = statusConfig.icon;
  const isActive = ACTIVE_STATUSES.includes(application.status);

  function handleClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;
    router.push(`/dashboard/applications/${application.id}`);
  }

  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:bg-muted/30 cursor-pointer"
    >
      {/* Company Logo */}
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-white flex items-center justify-center">
        {application.companyLogo ? (
          <img
            src={application.companyLogo}
            alt={application.company}
            className="h-7 w-7 object-contain"
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              el.style.display = "none";
              el.parentElement!.innerHTML = `<span class="text-sm font-bold text-muted-foreground">${application.company.charAt(0)}</span>`;
            }}
          />
        ) : (
          <span className="text-sm font-bold text-muted-foreground">
            {application.company.charAt(0)}
          </span>
        )}
      </div>

      {/* Job Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {application.jobTitle}
        </p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {application.company}
        </p>
      </div>

      {/* Status Badge */}
      <Badge variant={statusConfig.variant} className="shrink-0 gap-1">
        <StatusIcon className={`h-3 w-3 ${isActive ? "animate-spin" : ""} ${statusConfig.color}`} />
        {statusConfig.label}
      </Badge>

      {/* Actions */}
      {application.status === "failed" && onRetry && (
        <Button
          variant="outline"
          size="xs"
          onClick={() => onRetry(application.id!)}
        >
          <RefreshCw className="h-3 w-3" />
          Retry
        </Button>
      )}
      {application.status === "missing_profile_info" && onCompleteMissing && (
        <Button
          variant="outline"
          size="xs"
          onClick={() => onCompleteMissing(application)}
          className="gap-1"
        >
          <FileQuestion className="h-3 w-3" />
          Complete Info
        </Button>
      )}
    </div>
  );
}
