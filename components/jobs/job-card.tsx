"use client";

import type { CentralJob } from "@/types/central-job";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bookmark,
  BookmarkCheck,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface JobCardProps {
  job: CentralJob;
  matchScore: number;
  saved?: boolean;
  onSave: (jobId: string) => void;
  onApply: (job: CentralJob) => void;
}

function getScoreColor(score: number) {
  if (score >= 80) return { text: "text-green-600", bg: "bg-green-500", ring: "ring-green-200" };
  if (score >= 60) return { text: "text-blue-600", bg: "bg-blue-500", ring: "ring-blue-200" };
  if (score >= 40) return { text: "text-amber-600", bg: "bg-amber-500", ring: "ring-amber-200" };
  return { text: "text-red-600", bg: "bg-red-500", ring: "ring-red-200" };
}

function getLogoUrl(job: CentralJob): string {
  if (job.organizationLogo) return job.organizationLogo;
  if (job.orgDomain) return `https://img.logo.dev/${job.orgDomain}?token=pk_anonymous&size=64`;
  return "";
}

export function JobCard({ job, matchScore, saved, onSave, onApply }: JobCardProps) {
  const router = useRouter();
  const scoreColor = getScoreColor(matchScore);
  const logoUrl = getLogoUrl(job);

  function handleClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) return;
    router.push(`/dashboard/jobs/${job.id}`);
  }

  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:bg-muted/30 cursor-pointer"
    >
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-white flex items-center justify-center">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={job.organization}
            className="h-9 w-9 object-contain"
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              if (!el.dataset.fallback && job.orgDomain) {
                el.dataset.fallback = "1";
                el.src = `https://img.logo.dev/${job.orgDomain}?token=pk_anonymous&size=64`;
              } else {
                el.style.display = "none";
                el.parentElement!.innerHTML =
                  `<span class="text-sm font-bold text-muted-foreground">${job.organization.charAt(0)}</span>`;
              }
            }}
          />
        ) : (
          <span className="text-sm font-bold text-muted-foreground">
            {job.organization.charAt(0)}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">
            {job.organization}
          </p>
          <Badge variant="outline" className="text-[10px] shrink-0">
            {job.source}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {job.title}
        </p>
      </div>

      <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground shrink-0">
        <MapPin className="h-3 w-3" />
        {job.locationsRaw[0] || job.cities[0] || "Remote"}
      </div>

      <div className="hidden lg:flex items-center gap-1 shrink-0">
        {job.skills.slice(0, 3).map((skill) => (
          <Badge key={skill} variant="secondary" className="text-[10px] px-1.5 py-0">
            {skill}
          </Badge>
        ))}
      </div>

      <div className={`shrink-0 flex items-center justify-center h-9 w-9 rounded-full ring-2 ${scoreColor.ring}`}>
        <span className={`text-xs font-bold ${scoreColor.text}`}>
          {matchScore}%
        </span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onSave(job.id)}
          title={saved ? "Unsave" : "Save"}
        >
          {saved ? (
            <BookmarkCheck className="h-4 w-4 text-primary" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </Button>
        <Button variant="default" size="xs" onClick={() => onApply(job)}>
          <ExternalLink className="h-3 w-3" />
          Apply
        </Button>
      </div>
    </div>
  );
}
