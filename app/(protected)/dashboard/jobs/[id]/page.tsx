"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import type { NormalizedJob } from "@/types/job";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { updateDoc } from "firebase/firestore";
import { ApplyDialog } from "@/components/applications/apply-dialog";

function getScoreColor(score: number) {
  if (score >= 80) return "text-green-600 bg-green-50 ring-green-200";
  if (score >= 60) return "text-blue-600 bg-blue-50 ring-blue-200";
  if (score >= 40) return "text-amber-600 bg-amber-50 ring-amber-200";
  return "text-red-600 bg-red-50 ring-red-200";
}

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [job, setJob] = useState<NormalizedJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);

  useEffect(() => {
    async function loadJob() {
      if (!user || !params.id) return;
      try {
        const jobDoc = await getDoc(doc(db, "jobs", params.id));
        if (jobDoc.exists()) {
          const data = jobDoc.data() as Omit<NormalizedJob, "id">;
          if (data.userId === user.uid) {
            setJob({ id: jobDoc.id, ...data });
          }
        }
      } catch (err) {
        console.error("Failed to load job:", err);
      } finally {
        setLoading(false);
      }
    }
    loadJob();
  }, [user, params.id]);

  async function handleSave() {
    if (!job) return;
    const newSaved = !job.saved;
    setJob({ ...job, saved: newSaved });
    try {
      await updateDoc(doc(db, "jobs", job.id), { saved: newSaved });
    } catch {
      setJob({ ...job, saved: !newSaved });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/jobs"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>
        <p className="text-muted-foreground">Job not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/dashboard/jobs" className="hover:text-foreground transition-colors">
          Job Portals
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium truncate max-w-[300px]">
          {job.title}
        </span>
      </nav>

      {/* Header Card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          {/* Company Logo */}
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-white flex items-center justify-center">
            <img
              src={job.companyLogo}
              alt={job.company}
              className="h-10 w-10 object-contain"
              onError={(e) => {
                const el = e.target as HTMLImageElement;
                const domain = job.companyLogo.split("/")[3]?.split("?")[0];
                if (domain && !el.dataset.fallback) {
                  el.dataset.fallback = "1";
                  el.src = `https://img.logo.dev/${domain}?token=pk_anonymous&size=64`;
                } else {
                  el.style.display = "none";
                  el.parentElement!.innerHTML = `<span class="text-lg font-bold text-muted-foreground">${job.company.charAt(0)}</span>`;
                }
              }}
            />
          </div>

          {/* Title & Company */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-foreground">{job.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{job.company}</p>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {job.location}
              </div>
              {job.employmentType && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Briefcase className="h-3.5 w-3.5" />
                  {job.employmentType}
                </div>
              )}
              {job.postedDate && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {job.postedDate}
                </div>
              )}
              {job.salary && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <DollarSign className="h-3.5 w-3.5" />
                  {job.salary}
                </div>
              )}
            </div>
          </div>

          {/* Match Score */}
          <div className={`shrink-0 flex items-center justify-center h-14 w-14 rounded-full ring-2 ${getScoreColor(job.matchScore)}`}>
            <span className="text-sm font-bold">{job.matchScore}%</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border">
          <Button
            variant="default"
            className="flex-1 sm:flex-none"
            onClick={() => setApplyDialogOpen(true)}
          >
            <ExternalLink className="h-4 w-4" />
            Apply Now
          </Button>
          <Button variant="outline" onClick={handleSave}>
            {job.saved ? (
              <BookmarkCheck className="h-4 w-4 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
            {job.saved ? "Saved" : "Save Job"}
          </Button>
          {job.sourceUrl && job.sourceUrl !== job.applyUrl && (
            <a href={job.sourceUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm">
                View Source
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {job.description && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-base font-semibold text-foreground mb-3">Job Description</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {job.description}
              </p>
            </div>
          )}

          {/* Skills */}
          {job.skills.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-base font-semibold text-foreground mb-3">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs px-3 py-1">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Job Details */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="text-base font-semibold text-foreground">Details</h2>
            <div className="space-y-3">
              <DetailRow label="Company" value={job.company} />
              <DetailRow label="Location" value={job.location} />
              <DetailRow label="Country" value={job.country} />
              {job.experienceLevel && (
                <DetailRow label="Experience Level" value={job.experienceLevel} />
              )}
              {job.employmentType && (
                <DetailRow label="Employment Type" value={job.employmentType} />
              )}
              {job.salary && <DetailRow label="Salary" value={job.salary} />}
              <DetailRow label="Platform" value={job.platform} />
              {job.postedDate && <DetailRow label="Posted" value={job.postedDate} />}
            </div>
          </div>

          {/* Match Score Card */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold text-foreground mb-3">Match Score</h2>
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18" cy="18" r="15"
                    fill="none" strokeWidth="3"
                    className="stroke-muted"
                  />
                  <circle
                    cx="18" cy="18" r="15"
                    fill="none" strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${(job.matchScore / 100) * 94.2} 94.2`}
                    className="stroke-primary"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                  {job.matchScore}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Based on your resume skills, experience, and preferences.
              </p>
            </div>
          </div>

          {/* Apply Card */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
            <h2 className="text-base font-semibold text-foreground mb-2">Interested?</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Apply directly or let AI handle it for you.
            </p>
            <Button
              variant="default"
              className="w-full"
              onClick={() => setApplyDialogOpen(true)}
            >
              <ExternalLink className="h-4 w-4" />
              Apply Now
            </Button>
          </div>
        </div>
      </div>

      {/* Apply Dialog */}
      <ApplyDialog
        job={job}
        open={applyDialogOpen}
        onOpenChange={setApplyDialogOpen}
      />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium text-foreground">{value}</span>
    </div>
  );
}
