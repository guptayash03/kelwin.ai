"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import type { CentralJob } from "@/types/central-job";
import type { ParsedResumeData } from "@/types/resume";
import { scoreCentralJob } from "@/lib/jobs/match-score-adapter";
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
  Building2,
  Users,
  Globe,
  GraduationCap,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { ApplyDialog } from "@/components/applications/apply-dialog";

function getScoreColor(score: number) {
  if (score >= 80) return "text-green-600 bg-green-50 ring-green-200";
  if (score >= 60) return "text-blue-600 bg-blue-50 ring-blue-200";
  if (score >= 40) return "text-amber-600 bg-amber-50 ring-amber-200";
  return "text-red-600 bg-red-50 ring-red-200";
}

function formatSalary(job: CentralJob): string | null {
  if (!job.salaryMin && !job.salaryMax) return null;
  const currency = job.salaryCurrency || "USD";
  const unit = job.salaryUnit?.toLowerCase() === "year" ? "/yr" : job.salaryUnit ? `/${job.salaryUnit.toLowerCase()}` : "";
  if (job.salaryMin && job.salaryMax) {
    return `${currency} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}${unit}`;
  }
  if (job.salaryMin) return `${currency} ${job.salaryMin.toLocaleString()}+${unit}`;
  return `Up to ${currency} ${job.salaryMax!.toLocaleString()}${unit}`;
}

function getLogoUrl(job: CentralJob): string {
  if (job.organizationLogo) return job.organizationLogo;
  if (job.orgDomain) return `https://img.logo.dev/${job.orgDomain}?token=pk_anonymous&size=64`;
  return "";
}

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const [job, setJob] = useState<CentralJob | null>(null);
  const [matchScore, setMatchScore] = useState(0);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);

  useEffect(() => {
    async function loadJob() {
      if (!user || !params.id) return;
      try {
        const jobDoc = await getDoc(doc(db, "centralJobs", params.id));
        if (jobDoc.exists()) {
          const data = jobDoc.data() as Omit<CentralJob, "id">;
          setJob({ id: jobDoc.id, ...data });

          // Check saved status
          const savedDoc = await getDoc(doc(db, "users", user.uid, "savedJobs", params.id));
          setSaved(savedDoc.exists());

          // Compute match score
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const userData = userDoc.data();
          if (userData?.resumeId) {
            const resumeDoc = await getDoc(doc(db, "resumes", userData.resumeId));
            const resumeData = resumeDoc.data();
            if (resumeData?.parsedData) {
              const score = scoreCentralJob(
                { id: jobDoc.id, ...data },
                resumeData.parsedData as ParsedResumeData
              );
              setMatchScore(score);
            }
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
    if (!job || !user) return;
    const newSaved = !saved;
    setSaved(newSaved);
    try {
      const savedRef = doc(db, "users", user.uid, "savedJobs", job.id);
      if (newSaved) {
        await setDoc(savedRef, { savedAt: new Date() });
      } else {
        await deleteDoc(savedRef);
      }
    } catch {
      setSaved(!newSaved);
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
      <div className="space-y-4 p-6">
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

  const salary = formatSalary(job);
  const logoUrl = getLogoUrl(job);

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/dashboard/jobs" className="hover:text-foreground transition-colors">
          Jobs
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium truncate max-w-[300px]">
          {job.title}
        </span>
      </nav>

      {/* Header Card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-white flex items-center justify-center">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={job.organization}
                className="h-10 w-10 object-contain"
                onError={(e) => {
                  const el = e.target as HTMLImageElement;
                  if (!el.dataset.fallback && job.orgDomain) {
                    el.dataset.fallback = "1";
                    el.src = `https://img.logo.dev/${job.orgDomain}?token=pk_anonymous&size=64`;
                  } else {
                    el.style.display = "none";
                    el.parentElement!.innerHTML = `<span class="text-lg font-bold text-muted-foreground">${job.organization.charAt(0)}</span>`;
                  }
                }}
              />
            ) : (
              <span className="text-lg font-bold text-muted-foreground">
                {job.organization.charAt(0)}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-foreground">{job.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{job.organization}</p>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {job.locationsRaw[0] || job.cities[0] || "Remote"}
              </div>
              {job.employmentType.length > 0 && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Briefcase className="h-3.5 w-3.5" />
                  {job.employmentType.join(", ")}
                </div>
              )}
              {job.datePosted && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(job.datePosted).toLocaleDateString()}
                </div>
              )}
              {salary && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <DollarSign className="h-3.5 w-3.5" />
                  {salary}
                </div>
              )}
              {job.workArrangement && (
                <Badge variant="outline" className="text-xs">
                  {job.workArrangement}
                </Badge>
              )}
              {job.visaSponsorship && (
                <Badge variant="secondary" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Visa Sponsorship
                </Badge>
              )}
            </div>
          </div>

          <div className={`shrink-0 flex items-center justify-center h-14 w-14 rounded-full ring-2 ${getScoreColor(matchScore)}`}>
            <span className="text-sm font-bold">{matchScore}%</span>
          </div>
        </div>

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
            {saved ? (
              <BookmarkCheck className="h-4 w-4 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
            {saved ? "Saved" : "Save Job"}
          </Button>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Requirements Summary */}
          {job.requirementsSummary && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-base font-semibold text-foreground mb-3">Requirements</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {job.requirementsSummary}
              </p>
            </div>
          )}

          {/* Core Responsibilities */}
          {job.coreResponsibilities && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-base font-semibold text-foreground mb-3">Responsibilities</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {job.coreResponsibilities}
              </p>
            </div>
          )}

          {/* Full Description */}
          {job.descriptionHtml && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-base font-semibold text-foreground mb-3">Full Description</h2>
              <div
                className="prose prose-sm max-w-none text-muted-foreground [&_a]:text-primary [&_a]:underline [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-4"
                dangerouslySetInnerHTML={{ __html: job.descriptionHtml }}
              />
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

          {/* Benefits */}
          {job.benefits.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-base font-semibold text-foreground mb-3">Benefits</h2>
              <div className="flex flex-wrap gap-2">
                {job.benefits.map((benefit) => (
                  <Badge key={benefit} variant="outline" className="text-xs px-3 py-1">
                    {benefit}
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
              <DetailRow label="Company" value={job.organization} />
              <DetailRow label="Location" value={job.locationsRaw[0] || "Not specified"} />
              <DetailRow label="Country" value={job.countries[0] || "Not specified"} />
              {job.experienceLevel && (
                <DetailRow label="Experience" value={job.experienceLevel} />
              )}
              {job.employmentType.length > 0 && (
                <DetailRow label="Employment" value={job.employmentType.join(", ")} />
              )}
              {salary && <DetailRow label="Salary" value={salary} />}
              {job.education.length > 0 && (
                <DetailRow label="Education" value={job.education.join(", ")} />
              )}
              <DetailRow label="Source" value={job.source} />
              {job.datePosted && (
                <DetailRow label="Posted" value={new Date(job.datePosted).toLocaleDateString()} />
              )}
            </div>
          </div>

          {/* Organization Card */}
          {(job.orgIndustry || job.orgHeadcount || job.orgDescription) && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                About {job.organization}
              </h2>
              {job.orgDescription && (
                <p className="text-xs text-muted-foreground line-clamp-4">
                  {job.orgDescription}
                </p>
              )}
              <div className="space-y-2">
                {job.orgIndustry && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Briefcase className="h-3 w-3" />
                    {job.orgIndustry}
                  </div>
                )}
                {job.orgHeadcount && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {job.orgHeadcount.toLocaleString()} employees
                  </div>
                )}
                {job.orgWebsite && (
                  <a
                    href={job.orgWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-primary hover:underline"
                  >
                    <Globe className="h-3 w-3" />
                    Website
                  </a>
                )}
              </div>
            </div>
          )}

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
                    strokeDasharray={`${(matchScore / 100) * 94.2} 94.2`}
                    className="stroke-primary"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                  {matchScore}%
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
      <span className="text-xs font-medium text-foreground text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}
