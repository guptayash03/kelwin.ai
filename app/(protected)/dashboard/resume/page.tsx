"use client";

import { useEffect, useState, useCallback } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { useAuth } from "@/contexts/auth-context";
import { db, storage } from "@/lib/firebase";
import { uploadResume, type UploadProgress } from "@/lib/resume-upload";
import type { AIProviderName } from "@/lib/ai-providers/types";
import type { ResumeDocument, ParsedResumeData } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  FileText,
  Upload,
  Trash2,
  CheckCircle2,
  Clock,
  Star,
  StarOff,
  Download,
  AlertCircle,
} from "lucide-react";
import { ResumeDropzone } from "@/components/onboarding/resume-dropzone";
import { ProviderSelector } from "@/components/onboarding/provider-selector";

interface ResumeItem extends ResumeDocument {
  id: string;
}

export default function ResumePage() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ResumeItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchResumes = useCallback(async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "resumes"),
        where("userId", "==", user.uid)
      );
      const snapshot = await getDocs(q);
      const items: ResumeItem[] = snapshot.docs
        .map((d) => ({
          id: d.id,
          ...(d.data() as ResumeDocument),
        }))
        .sort((a, b) => {
          const aTime = (a.uploadedAt as { seconds?: number })?.seconds || 0;
          const bTime = (b.uploadedAt as { seconds?: number })?.seconds || 0;
          return bTime - aTime;
        });
      setResumes(items);

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      setActiveResumeId(userData?.resumeId || null);
    } catch (err) {
      console.error("Failed to fetch resumes:", err);
      setResumes([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  async function handleSetActive(resumeId: string) {
    if (!user) return;
    setActiveResumeId(resumeId);
    await updateDoc(doc(db, "users", user.uid), {
      resumeId,
      updatedAt: serverTimestamp(),
    });
  }

  function confirmDelete(resume: ResumeItem) {
    setDeleteTarget(resume);
    setDeleteDialogOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget || !user) return;
    setDeleting(true);
    try {
      // Delete from Storage
      try {
        const storageRef = ref(storage, deleteTarget.storagePath);
        await deleteObject(storageRef);
      } catch {
        // Storage file may already be gone
      }

      // Delete Firestore document
      await deleteDoc(doc(db, "resumes", deleteTarget.id));

      // If this was the active resume, clear it
      if (activeResumeId === deleteTarget.id) {
        setActiveResumeId(null);
        await updateDoc(doc(db, "users", user.uid), {
          resumeId: null,
          updatedAt: serverTimestamp(),
        });
      }

      setResumes((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    } catch (err) {
      console.error("Failed to delete resume:", err);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  }

  function handleUploadComplete() {
    setUploadDialogOpen(false);
    fetchResumes();
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function formatDate(timestamp: unknown): string {
    if (!timestamp) return "Unknown";
    const ts = timestamp as { seconds?: number; toDate?: () => Date };
    if (ts.seconds) {
      return new Date(ts.seconds * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    return "Unknown";
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Resumes</h2>
          <p className="text-sm text-muted-foreground">
            Manage your uploaded resumes. The active resume is used for job
            matching and applications.
          </p>
        </div>
        <Button variant="default" onClick={() => setUploadDialogOpen(true)}>
          <Upload className="h-4 w-4" />
          Upload Resume
        </Button>
      </div>

      {resumes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-16 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              No resumes uploaded
            </p>
            <p className="text-sm text-muted-foreground">
              Upload your first resume to get started with job matching.
            </p>
          </div>
          <Button variant="default" onClick={() => setUploadDialogOpen(true)}>
            <Upload className="h-4 w-4" />
            Upload Resume
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className={`rounded-xl border bg-card p-5 transition-colors ${
                activeResumeId === resume.id
                  ? "border-primary/50 bg-primary/5"
                  : "border-border hover:border-border/80"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 shrink-0">
                  <FileText className="h-5 w-5 text-red-500" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">
                      {resume.fileName}
                    </p>
                    {activeResumeId === resume.id && (
                      <Badge variant="default" className="shrink-0 text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(resume.fileSize)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(resume.uploadedAt)}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {resume.aiProvider}
                    </span>
                    {resume.parsed ? (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle2 className="h-3 w-3" />
                        Parsed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-amber-600">
                        <Clock className="h-3 w-3" />
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {activeResumeId !== resume.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetActive(resume.id)}
                      title="Set as active resume"
                    >
                      <Star className="h-4 w-4" />
                      Set Active
                    </Button>
                  )}
                  {resume.downloadURL && (
                    <a
                      href={resume.downloadURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Download"
                      className="inline-flex size-7 items-center justify-center rounded-[min(var(--radius-md),12px)] hover:bg-muted hover:text-foreground transition-all"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => confirmDelete(resume)}
                    title="Delete resume"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <UploadResumeDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onComplete={handleUploadComplete}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Resume</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm text-foreground">
                  Are you sure you want to delete{" "}
                  <span className="font-medium">
                    {deleteTarget?.fileName}
                  </span>
                  ?
                </p>
                <p className="text-xs text-muted-foreground">
                  This action cannot be undone. The file and all parsed data will
                  be permanently removed.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UploadResumeDialog({
  open,
  onOpenChange,
  onComplete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [provider, setProvider] = useState<AIProviderName>("azure-openai");
  const [state, setState] = useState<
    "idle" | "uploading" | "parsing" | "success" | "error"
  >("idle");
  const [progress, setProgress] = useState<UploadProgress>({
    bytesTransferred: 0,
    totalBytes: 0,
    percentage: 0,
  });
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setFile(null);
    setState("idle");
    setProgress({ bytesTransferred: 0, totalBytes: 0, percentage: 0 });
    setError(null);
  }

  function handleClose(isOpen: boolean) {
    if (!isOpen) {
      reset();
    }
    onOpenChange(isOpen);
  }

  async function handleUpload() {
    if (!file || !user) return;

    setState("uploading");
    setError(null);

    try {
      const token = await user.getIdToken(true);
      document.cookie = `__session=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

      const result = await uploadResume(file, user.uid, setProgress);

      setState("parsing");

      const response = await fetch("/api/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          downloadURL: result.downloadURL,
          provider,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to parse resume");
      }

      const data = await response.json();
      const parsedData: ParsedResumeData = data.parsedData;

      // Save to Firestore
      await addDoc(collection(db, "resumes"), {
        userId: user.uid,
        fileName: file.name,
        fileSize: file.size,
        mimeType: "application/pdf",
        storagePath: result.storagePath,
        downloadURL: result.downloadURL,
        uploadedAt: serverTimestamp(),
        aiProvider: provider,
        parsed: true,
        parsedAt: serverTimestamp(),
        parsedData,
      });

      setState("success");
      setTimeout(() => {
        onComplete();
        reset();
      }, 800);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setState("error");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload New Resume</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {state === "idle" || state === "error" ? (
            <>
              <ResumeDropzone onFileSelected={setFile} />
              <ProviderSelector selected={provider} onSelect={setProvider} />

              {error && (
                <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
            </>
          ) : state === "uploading" ? (
            <div className="space-y-3 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Uploading...</span>
                <span className="font-medium text-foreground">
                  {progress.percentage}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{file?.name}</p>
            </div>
          ) : state === "parsing" ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">
                Parsing resume with AI...
              </p>
            </div>
          ) : state === "success" ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
              <p className="text-sm font-medium text-foreground">
                Resume uploaded and parsed successfully!
              </p>
            </div>
          ) : null}
        </div>

        {(state === "idle" || state === "error") && (
          <DialogFooter>
            <Button variant="outline" onClick={() => handleClose(false)}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleUpload}
              disabled={!file}
            >
              <Upload className="h-3.5 w-3.5" />
              Upload & Parse
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
