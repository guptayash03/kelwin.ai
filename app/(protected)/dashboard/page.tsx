"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useApplications } from "@/hooks/use-applications";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { NormalizedJob } from "@/types/job";
import { ApplicationCard } from "@/components/applications/application-card";
import { ApplyDialog } from "@/components/applications/apply-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Crown,
  ArrowRight,
  Zap,
  Bot,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Bookmark,
  BookmarkCheck,
  MapPin,
  ChevronRight,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const {
    applications,
    loading: appsLoading,
    activeCount,
    queuedCount,
    appliedCount,
    failedCount,
  } = useApplications();

  const [jobs, setJobs] = useState<NormalizedJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [applyJob, setApplyJob] = useState<NormalizedJob | null>(null);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("gemini");
  const [savingProvider, setSavingProvider] = useState(false);
  const [applicationPassword, setApplicationPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const loadJobs = useCallback(async () => {
    if (!user) return;
    try {
      const q = query(collection(db, "jobs"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const cachedJobs: NormalizedJob[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<NormalizedJob, "id">),
        }));
        setJobs(cachedJobs.sort((a, b) => b.matchScore - a.matchScore));
      }
    } catch (err) {
      console.error("Failed to load jobs:", err);
    } finally {
      setJobsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    async function loadUserSettings() {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const data = userDoc.data();
        if (data?.selectedAIProvider) {
          setSelectedProvider(data.selectedAIProvider);
        }
        if (data?.applicationPassword) {
          setApplicationPassword(data.applicationPassword);
          setPasswordSaved(true);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    }
    loadUserSettings();
  }, [user]);

  async function handleProviderChange(provider: string) {
    if (!user) return;
    setSelectedProvider(provider);
    setSavingProvider(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        selectedAIProvider: provider,
      });
    } catch (err) {
      console.error("Failed to save provider:", err);
    } finally {
      setSavingProvider(false);
    }
  }

  async function handleSavePassword() {
    if (!user || !applicationPassword.trim()) return;
    setSavingPassword(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        applicationPassword: applicationPassword.trim(),
      });
      setPasswordSaved(true);
    } catch (err) {
      console.error("Failed to save password:", err);
    } finally {
      setSavingPassword(false);
    }
  }

  function handleApply(job: NormalizedJob) {
    setApplyJob(job);
    setApplyDialogOpen(true);
  }

  async function handleRetry(applicationId: string) {
    if (!user) return;
    try {
      const token = await user.getIdToken(true);
      document.cookie = `__session=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      await fetch("/api/applications/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      });
    } catch (err) {
      console.error("Retry failed:", err);
    }
  }

  const topJobs = jobs.slice(0, 4);
  const savedJobs = jobs.filter((j) => j.saved);
  const freeApplicationsLeft = Math.max(0, 10 - appliedCount);

  return (
    <div className="space-y-6">
      {/* Free Applications Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-5 py-3 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">
                {freeApplicationsLeft} Free AI Applications Left
              </h3>
              <p className="text-[11px] text-white/70">
                Upgrade for unlimited auto-apply
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 w-28">
              <div className="h-1.5 flex-1 rounded-full bg-white/20">
                <div
                  className="h-1.5 rounded-full bg-white transition-all"
                  style={{ width: `${(freeApplicationsLeft / 10) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-white/60">{appliedCount}/10</span>
            </div>
            <Button
              className="bg-white text-emerald-700 hover:bg-white/90 border-0 font-medium shadow-lg h-7 text-xs px-3"
              size="sm"
            >
              <Crown className="h-3 w-3" />
              Upgrade
            </Button>
          </div>
        </div>
      </div>

      {/* Two Column Layout: AI Provider + Password */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI Provider Card */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">AI Provider</h3>
            </div>
            {savingProvider && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "gemini", name: "Gemini 3 Pro", desc: "Google", logo: "/logos/gemini.svg" },
              { id: "azure-openai", name: "GPT-5.6", desc: "OpenAI", logo: "/logos/openai.svg" },
              { id: "bedrock-claude", name: "Claude Opus 4.8", desc: "Anthropic", logo: "/logos/claude.svg" },
            ].map((provider) => (
              <button
                key={provider.id}
                onClick={() => handleProviderChange(provider.id)}
                className={`relative flex flex-col items-center gap-1.5 rounded-lg border p-2.5 transition-all ${
                  selectedProvider === provider.id
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/40 hover:bg-muted/40"
                }`}
              >
                {selectedProvider === provider.id && (
                  <div className="absolute top-1.5 right-1.5">
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                  </div>
                )}
                <ProviderLogo src={provider.logo} name={provider.name} />
                <div className="text-center">
                  <p className="text-[11px] font-medium text-foreground">{provider.name}</p>
                  <p className="text-[9px] text-muted-foreground">{provider.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Application Password Card */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <KeyRound className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Application Password</h3>
          </div>
          <div className="space-y-2.5">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={applicationPassword}
                onChange={(e) => {
                  setApplicationPassword(e.target.value);
                  setPasswordSaved(false);
                }}
                placeholder="Set a password for job portals..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">
                AI uses this to sign up / log in on career portals
              </p>
              <Button
                variant={passwordSaved ? "outline" : "default"}
                size="xs"
                onClick={handleSavePassword}
                disabled={savingPassword || !applicationPassword.trim() || passwordSaved}
              >
                {savingPassword ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : passwordSaved ? (
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                ) : null}
                {passwordSaved ? "Saved" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Top Job Matches */}
      {!jobsLoading && topJobs.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Top Job Matches</h3>
            <Link href="/dashboard/jobs">
              <Button variant="ghost" size="xs" className="text-muted-foreground">
                See All Jobs
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {topJobs.map((job, i) => (
              <TopJobCard key={job.id} job={job} index={i} onApply={handleApply} />
            ))}
          </div>
        </div>
      )}

      {/* Application Progress Tracker */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Application Progress</h3>
          </div>
          <Link href="/dashboard/applications">
            <Button variant="ghost" size="xs" className="text-muted-foreground">
              View All
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-3 text-center">
            <Loader2 className="h-4 w-4 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{activeCount}</p>
            <p className="text-[10px] text-muted-foreground">In Progress</p>
          </div>
          <div className="rounded-lg bg-slate-50 dark:bg-slate-500/10 border border-slate-200 dark:border-slate-500/20 p-3 text-center">
            <Clock className="h-4 w-4 text-slate-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{queuedCount}</p>
            <p className="text-[10px] text-muted-foreground">Queued</p>
          </div>
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-3 text-center">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{appliedCount}</p>
            <p className="text-[10px] text-muted-foreground">Applied</p>
          </div>
          <div className="rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 p-3 text-center">
            <AlertCircle className="h-4 w-4 text-rose-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{failedCount}</p>
            <p className="text-[10px] text-muted-foreground">Failed</p>
          </div>
        </div>

        {/* Recent Applications */}
        {appsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : applications.length > 0 ? (
          <div className="space-y-2">
            {applications.slice(0, 5).map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                onRetry={handleRetry}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted mb-2">
              <Sparkles className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No applications yet. Use Easy Apply on any job to get started.
            </p>
            <Link href="/dashboard/jobs">
              <Button variant="default" size="sm" className="mt-3">
                Browse Jobs
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Saved Jobs */}
      {!jobsLoading && savedJobs.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookmarkCheck className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Saved Jobs
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {savedJobs.length}
                </span>
              </h3>
            </div>
            <Link href="/dashboard/jobs">
              <Button variant="ghost" size="xs" className="text-muted-foreground">
                View All
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            {savedJobs.slice(0, 5).map((job) => (
              <SavedJobRow key={job.id} job={job} onApply={handleApply} />
            ))}
          </div>
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

function CompanyLogo({ src, name, size }: { src: string; name: string; size: "sm" | "md" }) {
  const [failed, setFailed] = useState(false);
  const dims = size === "sm" ? "h-6 w-6" : "h-9 w-9";
  const imgDims = size === "sm" ? "h-4 w-4" : "h-6 w-6";
  const textSize = size === "sm" ? "text-[9px]" : "text-xs";
  const textColor = size === "sm" ? "text-emerald-800" : "text-muted-foreground";
  const borderClass = size === "md" ? "border border-border" : "";

  if (failed) {
    return (
      <div className={`${dims} rounded-md overflow-hidden bg-white shrink-0 flex items-center justify-center ${borderClass}`}>
        <span className={`${textSize} font-bold ${textColor}`}>{name.charAt(0)}</span>
      </div>
    );
  }
  return (
    <div className={`${dims} rounded-md overflow-hidden bg-white shrink-0 flex items-center justify-center ${borderClass}`}>
      <img src={src} alt={name} className={`${imgDims} object-contain`} onError={() => setFailed(true)} />
    </div>
  );
}

function ProviderLogo({ src, name }: { src: string; name: string }) {
  if (name.startsWith("Gemini")) {
    return (
      <div className="flex h-8 w-8 items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
          <path d="M12 0C12 6.63 6.63 12 0 12C6.63 12 12 17.37 12 24C12 17.37 17.37 12 24 12C17.37 12 12 6.63 12 0Z" fill="url(#gemini_g)"/>
          <defs>
            <radialGradient id="gemini_g" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(12 12) scale(12)">
              <stop stopColor="#1BA1E3"/>
              <stop offset="0.3" stopColor="#5489D6"/>
              <stop offset="0.55" stopColor="#9B72CB"/>
              <stop offset="0.75" stopColor="#D96570"/>
              <stop offset="1" stopColor="#F49C46"/>
            </radialGradient>
          </defs>
        </svg>
      </div>
    );
  }
  if (name.startsWith("GPT")) {
    return (
      <div className="flex h-8 w-8 items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
          <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.998 5.998 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" fill="#000000"/>
        </svg>
      </div>
    );
  }
  if (name.startsWith("Claude")) {
    return (
      <div className="flex h-8 w-8 items-center justify-center">
        <svg viewBox="0 0 512 509.64" className="h-7 w-7">
          <path fill="#D77655" d="M115.612 0h280.775C459.974 0 512 52.026 512 115.612v278.415c0 63.587-52.026 115.612-115.613 115.612H115.612C52.026 509.639 0 457.614 0 394.027V115.612C0 52.026 52.026 0 115.612 0z"/>
          <path fill="#FCF2EE" fillRule="nonzero" d="M142.27 316.619l73.655-41.326 1.238-3.589-1.238-1.996-3.589-.001-12.31-.759-42.084-1.138-36.498-1.516-35.361-1.896-8.897-1.895-8.34-10.995.859-5.484 7.482-5.03 10.717.935 23.683 1.617 35.537 2.452 25.782 1.517 38.193 3.968h6.064l.86-2.451-2.073-1.517-1.618-1.517-36.776-24.922-39.81-26.338-20.852-15.166-11.273-7.683-5.687-7.204-2.451-15.721 10.237-11.273 13.75.935 3.513.936 13.928 10.716 29.749 23.027 38.848 28.612 5.687 4.727 2.275-1.617.278-1.138-2.553-4.271-21.13-38.193-22.546-38.848-10.035-16.101-2.654-9.655c-.935-3.968-1.617-7.304-1.617-11.374l11.652-15.823 6.445-2.073 15.545 2.073 6.547 5.687 9.655 22.092 15.646 34.78 24.265 47.291 7.103 14.028 3.791 12.992 1.416 3.968 2.449-.001v-2.275l1.997-26.641 3.69-32.707 3.589-42.084 1.239-11.854 5.863-14.206 11.652-7.683 9.099 4.348 7.482 10.716-1.036 6.926-4.449 28.915-8.72 45.294-5.687 30.331h3.313l3.792-3.791 15.342-20.372 25.782-32.227 11.374-12.789 13.27-14.129 8.517-6.724 16.1-.001 11.854 17.617-5.307 18.199-16.581 21.029-13.75 17.819-19.716 26.54-12.309 21.231 1.138 1.694 2.932-.278 44.536-9.479 24.062-4.347 28.714-4.928 12.992 6.066 1.416 6.167-5.106 12.613-30.71 7.583-36.018 7.204-53.636 12.689-.657.48.758.935 24.164 2.275 10.337.556h25.301l47.114 3.514 12.309 8.139 7.381 9.959-1.238 7.583-18.957 9.655-25.579-6.066-59.702-14.205-20.474-5.106-2.83-.001v1.694l17.061 16.682 31.266 28.233 39.152 36.397 1.997 8.999-5.03 7.102-5.307-.758-34.401-25.883-13.27-11.651-30.053-25.302-1.996-.001v2.654l6.926 10.136 36.574 54.975 1.895 16.859-2.653 5.485-9.479 3.311-10.414-1.895-21.408-30.054-22.092-33.844-17.819-30.331-2.173 1.238-10.515 113.261-4.929 5.788-11.374 4.348-9.478-7.204-5.03-11.652 5.03-23.027 6.066-30.052 4.928-23.886 4.449-29.674 2.654-9.858-.177-.657-2.173.278-22.37 30.71-34.021 45.977-26.919 28.815-6.445 2.553-11.173-5.789 1.037-10.337 6.243-9.2 37.257-47.392 22.47-29.371 14.508-16.961-.101-2.451h-.859l-98.954 64.251-17.618 2.275-7.583-7.103.936-11.652 3.589-3.791 29.749-20.474-.101.102.024.101z"/>
        </svg>
      </div>
    );
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
      <span className="text-sm font-bold text-muted-foreground">{name.charAt(0)}</span>
    </div>
  );
}

const CARD_GRADIENTS = [
  "from-emerald-600 to-teal-700",
  "from-teal-600 to-cyan-700",
  "from-green-600 to-emerald-700",
  "from-cyan-600 to-sky-700",
];

function TopJobCard({
  job,
  index,
  onApply,
}: {
  job: NormalizedJob;
  index: number;
  onApply: (job: NormalizedJob) => void;
}) {
  const router = useRouter();

  return (
    <div
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) return;
        router.push(`/dashboard/jobs/${job.id}`);
      }}
      className={`relative rounded-xl bg-gradient-to-br ${CARD_GRADIENTS[index % CARD_GRADIENTS.length]} p-4 text-white overflow-hidden flex flex-col justify-between min-h-[140px] cursor-pointer transition-transform hover:scale-[1.02]`}
    >
      {/* Match Score */}
      <div className="absolute top-3 right-3">
        <div className="relative h-9 w-9">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18" cy="18" r="15" fill="none"
              strokeWidth="3" className="stroke-white/20"
            />
            <circle
              cx="18" cy="18" r="15" fill="none"
              strokeWidth="3" strokeLinecap="round"
              strokeDasharray={`${(job.matchScore / 100) * 94.2} 94.2`}
              className="stroke-white"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
            {job.matchScore}%
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="pr-10">
        <p className="text-[11px] text-white/70 mb-0.5">{job.company}</p>
        <h4 className="text-xs font-semibold leading-tight line-clamp-2">{job.title}</h4>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5">
          <CompanyLogo src={job.companyLogo} name={job.company} size="sm" />
        </div>
        <Button
          variant="secondary"
          size="xs"
          className="bg-white/95 text-gray-800 hover:bg-white border-0 text-[11px] font-medium h-6 px-2"
          onClick={() => onApply(job)}
        >
          Apply
        </Button>
      </div>
    </div>
  );
}

function SavedJobRow({
  job,
  onApply,
}: {
  job: NormalizedJob;
  onApply: (job: NormalizedJob) => void;
}) {
  const router = useRouter();

  function getScoreColor(score: number) {
    if (score >= 80) return "text-green-600 ring-green-200";
    if (score >= 60) return "text-blue-600 ring-blue-200";
    if (score >= 40) return "text-amber-600 ring-amber-200";
    return "text-red-600 ring-red-200";
  }

  return (
    <div
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) return;
        router.push(`/dashboard/jobs/${job.id}`);
      }}
      className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-muted/30 cursor-pointer"
    >
      <CompanyLogo src={job.companyLogo} name={job.company} size="md" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{job.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs text-muted-foreground truncate">{job.company}</p>
          {job.location && (
            <span className="hidden sm:flex items-center gap-0.5 text-[11px] text-muted-foreground">
              <MapPin className="h-2.5 w-2.5" />
              {job.location}
            </span>
          )}
        </div>
      </div>
      <div className={`shrink-0 flex items-center justify-center h-8 w-8 rounded-full ring-2 ${getScoreColor(job.matchScore)}`}>
        <span className={`text-[10px] font-bold ${getScoreColor(job.matchScore).split(" ")[0]}`}>
          {job.matchScore}%
        </span>
      </div>
      <Button variant="default" size="xs" onClick={() => onApply(job)}>
        Apply
      </Button>
    </div>
  );
}
