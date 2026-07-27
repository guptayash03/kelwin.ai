"use client";

import { useState } from "react";
import type { CentralJob } from "@/types/central-job";
import { JobCard } from "./job-card";
import { Button } from "@/components/ui/button";

interface JobListProps {
  jobs: Array<{ job: CentralJob; matchScore: number }>;
  savedJobIds: Set<string>;
  onSave: (jobId: string) => void;
  onApply: (job: CentralJob) => void;
}

type SortBy = "matchScore" | "postedDate" | "company";

export function JobList({ jobs, savedJobIds, onSave, onApply }: JobListProps) {
  const [sortBy, setSortBy] = useState<SortBy>("matchScore");

  const sorted = [...jobs].sort((a, b) => {
    switch (sortBy) {
      case "matchScore":
        return b.matchScore - a.matchScore;
      case "postedDate":
        return (b.job.datePosted || "").localeCompare(a.job.datePosted || "");
      case "company":
        return a.job.organization.localeCompare(b.job.organization);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">
          All Jobs
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {jobs.length}
          </span>
        </h3>
        <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
          <Button
            variant={sortBy === "matchScore" ? "secondary" : "ghost"}
            size="xs"
            onClick={() => setSortBy("matchScore")}
          >
            Match
          </Button>
          <Button
            variant={sortBy === "postedDate" ? "secondary" : "ghost"}
            size="xs"
            onClick={() => setSortBy("postedDate")}
          >
            Recent
          </Button>
          <Button
            variant={sortBy === "company" ? "secondary" : "ghost"}
            size="xs"
            onClick={() => setSortBy("company")}
          >
            Company
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        {sorted.map(({ job, matchScore }) => (
          <JobCard
            key={job.id}
            job={job}
            matchScore={matchScore}
            saved={savedJobIds.has(job.id)}
            onSave={onSave}
            onApply={onApply}
          />
        ))}
      </div>
    </div>
  );
}
