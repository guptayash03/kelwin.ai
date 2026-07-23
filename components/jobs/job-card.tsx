"use client";

import type { NormalizedJob } from "@/types/job";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bookmark,
  BookmarkCheck,
  MapPin,
  ExternalLink,
} from "lucide-react";

interface JobCardProps {
  job: NormalizedJob;
  onSave: (jobId: string) => void;
}

function getScoreColor(score: number) {
  if (score >= 80) return { text: "text-green-600", bg: "bg-green-500", ring: "ring-green-200" };
  if (score >= 60) return { text: "text-blue-600", bg: "bg-blue-500", ring: "ring-blue-200" };
  if (score >= 40) return { text: "text-amber-600", bg: "bg-amber-500", ring: "ring-amber-200" };
  return { text: "text-red-600", bg: "bg-red-500", ring: "ring-red-200" };
}

export function JobCard({ job, onSave }: JobCardProps) {
  const scoreColor = getScoreColor(job.matchScore);

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:bg-muted/30">
      {/* Company Logo */}
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-white flex items-center justify-center">
        <img
          src={job.companyLogo}
          alt={job.company}
          className="h-9 w-9 object-contain"
          onError={(e) => {
            const el = e.target as HTMLImageElement;
            const domain = job.companyLogo.split("/")[3]?.split("?")[0];
            if (domain && !el.dataset.fallback) {
              el.dataset.fallback = "1";
              el.src = `https://img.logo.dev/${domain}?token=pk_anonymous&size=64`;
            } else {
              el.style.display = "none";
              el.parentElement!.innerHTML =
                `<span class="text-sm font-bold text-muted-foreground">${job.company.charAt(0)}</span>`;
            }
          }}
        />
      </div>

      {/* Job Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">
            {job.company}
          </p>
          <Badge variant="outline" className="text-[10px] shrink-0">
            {job.platform}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {job.title}
        </p>
      </div>

      {/* Location */}
      <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground shrink-0">
        <MapPin className="h-3 w-3" />
        {job.location}
      </div>

      {/* Skills */}
      <div className="hidden lg:flex items-center gap-1 shrink-0">
        {job.skills.slice(0, 3).map((skill) => (
          <Badge key={skill} variant="secondary" className="text-[10px] px-1.5 py-0">
            {skill}
          </Badge>
        ))}
      </div>

      {/* Match Score */}
      <div className={`shrink-0 flex items-center justify-center h-9 w-9 rounded-full ring-2 ${scoreColor.ring}`}>
        <span className={`text-xs font-bold ${scoreColor.text}`}>
          {job.matchScore}%
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onSave(job.id)}
          title={job.saved ? "Unsave" : "Save"}
        >
          {job.saved ? (
            <BookmarkCheck className="h-4 w-4 text-primary" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </Button>
        <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="default" size="xs">
            <ExternalLink className="h-3 w-3" />
            Apply
          </Button>
        </a>
      </div>
    </div>
  );
}
