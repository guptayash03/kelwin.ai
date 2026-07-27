"use client";

import { useState, useCallback, useEffect } from "react";
import {
  getDocs,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import type { CentralJob, JobFilters } from "@/types/central-job";
import type { ParsedResumeData } from "@/types/resume";
import { buildJobQuery, applyClientFilters } from "@/lib/jobs/query";
import { scoreCentralJob } from "@/lib/jobs/match-score-adapter";

export interface ScoredJob {
  job: CentralJob;
  matchScore: number;
}

export function useCentralJobs(resume: ParsedResumeData | null) {
  const [jobs, setJobs] = useState<ScoredJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<JobFilters>({});
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(
    async (isLoadMore = false) => {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setLastDoc(null);
      }
      setError(null);

      try {
        const q = buildJobQuery(filters, isLoadMore ? lastDoc : null);
        const snapshot = await getDocs(q);

        const rawResults = snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }));

        const filtered = applyClientFilters(rawResults, filters);

        const scored: ScoredJob[] = filtered.map(({ id, data }) => {
          const job: CentralJob = { id, ...data } as CentralJob;
          const matchScore = resume ? scoreCentralJob(job, resume) : 0;
          return { job, matchScore };
        });

        if (isLoadMore) {
          setJobs((prev) => [...prev, ...scored]);
        } else {
          setJobs(scored);
        }

        setHasMore(snapshot.docs.length >= 25);
        if (snapshot.docs.length > 0) {
          setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load jobs";
        setError(message);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filters, lastDoc, resume]
  );

  useEffect(() => {
    fetchJobs(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchJobs(true);
    }
  }, [loadingMore, hasMore, fetchJobs]);

  const updateFilters = useCallback((newFilters: Partial<JobFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  return {
    jobs,
    loading,
    loadingMore,
    hasMore,
    error,
    filters,
    loadMore,
    updateFilters,
    resetFilters,
  };
}
