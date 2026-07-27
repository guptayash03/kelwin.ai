"use client";

import { useState, useCallback, useEffect } from "react";
import {
  getDocs,
  collection,
  query,
  where,
  orderBy,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { CentralJob, JobFilters } from "@/types/central-job";
import type { ParsedResumeData } from "@/types/resume";
import { applyClientFilters } from "@/lib/jobs/query";
import { scoreCentralJob } from "@/lib/jobs/match-score-adapter";

export interface ScoredJob {
  job: CentralJob;
  matchScore: number;
}

/**
 * Fetches active central jobs, scores them against the resume, and applies client-side filters.
 *
 * @param resume - The parsed resume used to calculate job match scores, or `null` to assign a score of zero.
 * @returns The filtered jobs, loading state, fetch error, active filters, and filter update functions.
 */
export function useCentralJobs(resume: ParsedResumeData | null) {
  const [allJobs, setAllJobs] = useState<ScoredJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<JobFilters>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAllJobs() {
      setLoading(true);
      setError(null);

      try {
        const q = query(
          collection(db, "centralJobs"),
          where("status", "==", "active"),
          orderBy("lastSyncedAt", "desc")
        );
        const snapshot = await getDocs(q);

        const rawResults = snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }));

        const scored: ScoredJob[] = rawResults.map(({ id, data }) => {
          const job: CentralJob = { id, ...data } as CentralJob;
          const matchScore = resume ? scoreCentralJob(job, resume) : 0;
          return { job, matchScore };
        });

        setAllJobs(scored);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load jobs";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchAllJobs();
  }, [resume]);

  const filteredJobs = applyClientFilters(
    allJobs.map(({ job }) => ({ id: job.id, data: job as unknown as DocumentData })),
    filters
  ).map(({ id }) => allJobs.find((j) => j.job.id === id)!);

  const updateFilters = useCallback((newFilters: Partial<JobFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  return {
    jobs: filteredJobs,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
  };
}
