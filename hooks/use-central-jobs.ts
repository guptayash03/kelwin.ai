"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { CentralJob, JobFilters } from "@/types/central-job";
import type { ParsedResumeData } from "@/types/resume";
import { applyClientFilters } from "@/lib/jobs/query";
import { scoreCentralJob } from "@/lib/jobs/match-score-adapter";

const MAX_JOBS = 500;

export interface ScoredJob {
  job: CentralJob;
  matchScore: number;
}

export function useCentralJobs(resume: ParsedResumeData | null) {
  const [allJobs, setAllJobs] = useState<ScoredJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<JobFilters>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAllJobs() {
      setLoading(true);
      setError(null);

      try {
        const q = query(
          collection(db, "centralJobs"),
          where("status", "==", "active"),
          where("_countries", "array-contains", "india"),
          orderBy("lastSyncedAt", "desc"),
          limit(MAX_JOBS)
        );
        const snapshot = await getDocs(q);
        if (cancelled) return;

        const scored: ScoredJob[] = snapshot.docs.map((doc) => {
          const job: CentralJob = { id: doc.id, ...doc.data() } as CentralJob;
          const matchScore = resume ? scoreCentralJob(job, resume) : 0;
          return { job, matchScore };
        });

        setAllJobs(scored);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Failed to load jobs";
        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAllJobs();
    return () => { cancelled = true; };
  }, [resume]);

  const filteredJobs = useMemo(() => {
    const jobMap = new Map(allJobs.map((s) => [s.job.id, s]));
    const filtered = applyClientFilters(
      allJobs.map(({ job }) => ({ id: job.id, data: job as unknown as DocumentData })),
      filters
    );
    return filtered.map(({ id }) => jobMap.get(id)!);
  }, [allJobs, filters]);

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
