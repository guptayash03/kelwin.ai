"use client";

import { useEffect, useState, useCallback } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import type { JobPlatform, NormalizedJob } from "@/types/job";
import type { ParsedResumeData } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { PlatformSelector } from "@/components/jobs/platform-selector";
import { TopMatches } from "@/components/jobs/top-matches";
import { JobList } from "@/components/jobs/job-list";
import { JobCardSkeleton } from "@/components/jobs/job-card-skeleton";
import { EmptyState } from "@/components/jobs/empty-state";
import { Search, RefreshCw, AlertCircle } from "lucide-react";

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<NormalizedJob[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<JobPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheStatus, setCacheStatus] = useState<"fresh" | "stale" | "empty">(
    "empty"
  );

  const loadCachedJobs = useCallback(async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "jobs"),
        where("userId", "==", user.uid)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setCacheStatus("empty");
        setJobs([]);
        return;
      }

      const cachedJobs: NormalizedJob[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<NormalizedJob, "id">),
      }));

      // Check freshness
      const latestFetch = cachedJobs.reduce((latest, job) => {
        const ts = job.fetchedAt as { seconds?: number };
        const seconds = ts?.seconds || 0;
        return seconds > latest ? seconds : latest;
      }, 0);

      const isFresh = Date.now() - latestFetch * 1000 < CACHE_TTL_MS;

      if (isFresh && cachedJobs.length > 0) {
        setCacheStatus("fresh");
        setJobs(
          cachedJobs.sort((a, b) => b.matchScore - a.matchScore)
        );
      } else {
        setCacheStatus("stale");
        setJobs(
          cachedJobs.sort((a, b) => b.matchScore - a.matchScore)
        );
      }
    } catch (err) {
      console.error("Failed to load cached jobs:", err);
      setCacheStatus("empty");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCachedJobs();
  }, [loadCachedJobs]);

  function togglePlatform(platform: JobPlatform) {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  }

  async function handleSearch() {
    if (!user || selectedPlatforms.length === 0) return;

    setSearching(true);
    setError(null);

    try {
      // Fetch user's resume data for matching
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      let resumeData: ParsedResumeData | null = null;

      if (userData?.resumeId) {
        const resumeDoc = await getDoc(
          doc(db, "resumes", userData.resumeId)
        );
        const resume = resumeDoc.data();
        if (resume?.parsedData) {
          resumeData = resume.parsedData as ParsedResumeData;
        }
      }

      if (!resumeData) {
        setError(
          "No resume found. Please upload a resume first for job matching."
        );
        setSearching(false);
        return;
      }

      // Refresh session token
      const token = await user.getIdToken(true);
      document.cookie = `__session=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

      // Call the search API
      const response = await fetch("/api/jobs/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platforms: selectedPlatforms,
          resumeData,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Search failed");
      }

      const data = await response.json();
      const newJobs = data.jobs as Omit<NormalizedJob, "id" | "fetchedAt">[];

      // Preserve saved status from existing jobs
      const savedIds = new Set(
        jobs.filter((j) => j.saved).map((j) => j.externalId)
      );

      // Clear old cached jobs for this user
      const existingQuery = query(
        collection(db, "jobs"),
        where("userId", "==", user.uid)
      );
      const existingDocs = await getDocs(existingQuery);
      const deletePromises = existingDocs.docs.map((d) => deleteDoc(d.ref));
      await Promise.all(deletePromises);

      // Write new jobs to Firestore
      const writePromises = newJobs.map((job) =>
        addDoc(collection(db, "jobs"), {
          ...job,
          userId: user.uid,
          saved: savedIds.has(job.externalId),
          fetchedAt: serverTimestamp(),
        })
      );
      const writtenDocs = await Promise.all(writePromises);

      // Set local state with IDs
      const jobsWithIds: NormalizedJob[] = newJobs.map((job, i) => ({
        ...job,
        id: writtenDocs[i].id,
        userId: user.uid,
        saved: savedIds.has(job.externalId),
        fetchedAt: { seconds: Math.floor(Date.now() / 1000) },
      }));

      setJobs(jobsWithIds);
      setCacheStatus("fresh");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setSearching(false);
    }
  }

  async function handleSave(jobId: string) {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    const newSaved = !job.saved;
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, saved: newSaved } : j))
    );

    try {
      await updateDoc(doc(db, "jobs", jobId), { saved: newSaved });
    } catch (err) {
      // Revert on failure
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, saved: !newSaved } : j))
      );
      console.error("Failed to save job:", err);
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Jobs</h2>
          <p className="text-sm text-muted-foreground">
            Discover software engineering jobs at top companies in India.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="default"
            onClick={handleSearch}
            disabled={selectedPlatforms.length === 0 || searching}
          >
            {searching ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            {searching ? "Searching..." : "Search Jobs"}
          </Button>
        </div>
      </div>

{/* Platform Selector */}
      <PlatformSelector
        selected={selectedPlatforms}
        onToggle={togglePlatform}
      />

      {/* Error State */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Loading Skeletons */}
      {searching && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Results */}
      {!searching && jobs.length > 0 && (
        <>
          <TopMatches
            jobs={jobs}
            onApply={(url) => window.open(url, "_blank", "noopener,noreferrer")}
          />
          <JobList jobs={jobs} onSave={handleSave} />
        </>
      )}

      {/* Empty State */}
      {!searching && jobs.length === 0 && !error && (
        <EmptyState />
      )}
    </div>
  );
}
