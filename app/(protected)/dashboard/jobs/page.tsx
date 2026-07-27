"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { doc, getDoc, collection, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import type { CentralJob } from "@/types/central-job";
import type { ParsedResumeData } from "@/types/resume";
import { useCentralJobs } from "@/hooks/use-central-jobs";
import { FilterBar } from "@/components/jobs/filter-bar";
import { TopMatches } from "@/components/jobs/top-matches";
import { JobList } from "@/components/jobs/job-list";
import { JobCardSkeleton } from "@/components/jobs/job-card-skeleton";
import { EmptyState } from "@/components/jobs/empty-state";
import { ApplyDialog } from "@/components/applications/apply-dialog";
import { AlertCircle } from "lucide-react";

export default function JobsPage() {
  const { user } = useAuth();
  const [resume, setResume] = useState<ParsedResumeData | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [applyJob, setApplyJob] = useState<CentralJob | null>(null);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);

  // Load user's resume for scoring
  useEffect(() => {
    async function loadResume() {
      if (!user) return;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      if (userData?.resumeId) {
        const resumeDoc = await getDoc(doc(db, "resumes", userData.resumeId));
        const data = resumeDoc.data();
        if (data?.parsedData) {
          setResume(data.parsedData as ParsedResumeData);
        }
      }
    }
    loadResume();
  }, [user]);

  // Load saved job IDs
  useEffect(() => {
    async function loadSaved() {
      if (!user) return;
      const snapshot = await getDocs(collection(db, "users", user.uid, "savedJobs"));
      setSavedJobIds(new Set(snapshot.docs.map((d) => d.id)));
    }
    loadSaved();
  }, [user]);

  const {
    jobs,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
  } = useCentralJobs(resume);

  // Top matches sorted by score
  const topMatches = useMemo(() => {
    return [...jobs].sort((a, b) => b.matchScore - a.matchScore).slice(0, 12);
  }, [jobs]);

  const handleSave = useCallback(
    async (jobId: string) => {
      if (!user) return;
      const savedRef = doc(db, "users", user.uid, "savedJobs", jobId);
      if (savedJobIds.has(jobId)) {
        await deleteDoc(savedRef);
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
      } else {
        await setDoc(savedRef, { savedAt: new Date() });
        setSavedJobIds((prev) => new Set(prev).add(jobId));
      }
    },
    [user, savedJobIds]
  );

  const handleApply = useCallback((job: CentralJob) => {
    setApplyJob(job);
    setApplyDialogOpen(true);
  }, []);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Jobs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Entry-level software engineering roles in India, updated daily.
        </p>
      </div>

      {/* Filters */}
      <FilterBar
        filters={filters}
        onFilterChange={updateFilters}
        onReset={resetFilters}
      />

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Content */}
      {!loading && jobs.length === 0 && <EmptyState />}

      {!loading && jobs.length > 0 && (
        <div className="space-y-8">
          <TopMatches jobs={topMatches} onApply={handleApply} />
          <JobList
            jobs={jobs}
            savedJobIds={savedJobIds}
            onSave={handleSave}
            onApply={handleApply}
          />
        </div>
      )}

      {/* Apply Dialog */}
      <ApplyDialog
        job={applyJob}
        open={applyDialogOpen}
        onOpenChange={setApplyDialogOpen}
      />
    </div>
  );
}
