"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  doc,
  collection,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Check, Sparkles, FileText, Zap } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { uploadResume, type UploadProgress } from "@/lib/resume-upload";
import type { AIProviderName } from "@/lib/ai-providers/types";
import type { ParsedResumeData } from "@/types/resume";
import { ResumeDropzone } from "@/components/onboarding/resume-dropzone";
import { ProviderSelector } from "@/components/onboarding/provider-selector";
import { UploadProgress as UploadProgressUI } from "@/components/onboarding/upload-progress";
import { ParsingAnimation } from "@/components/onboarding/parsing-animation";
import { OnboardingSuccess } from "@/components/onboarding/onboarding-success";

type OnboardingState = "idle" | "uploading" | "parsing" | "success" | "error";

const PROVIDER_NAMES: Record<AIProviderName, string> = {
  gemini: "Google Gemini",
  "azure-openai": "Azure OpenAI",
  "bedrock-claude": "AWS Bedrock (Claude)",
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [state, setState] = useState<OnboardingState>("idle");
  const [provider, setProvider] = useState<AIProviderName>("azure-openai");
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    bytesTransferred: 0,
    totalBytes: 0,
    percentage: 0,
  });
  const [parsedData, setParsedData] = useState<ParsedResumeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadMeta, setUploadMeta] = useState<{
    storagePath: string;
    downloadURL: string;
  } | null>(null);

  function handleFileSelected(selectedFile: File) {
    setFile(selectedFile);
    setError(null);
  }

  async function handleStart() {
    if (!file || !user) return;

    setState("uploading");
    setError(null);

    try {
      const token = await user.getIdToken(true);
      document.cookie = `__session=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

      const result = await uploadResume(file, user.uid, setUploadProgress);
      setUploadMeta(result);

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
      setParsedData(data.parsedData);
      setState("success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setState("error");
    }
  }

  async function handleContinue() {
    if (!parsedData || !uploadMeta || !user || !file) return;

    setSaving(true);
    try {
      // Save resume document
      const resumeRef = await addDoc(collection(db, "resumes"), {
        userId: user.uid,
        fileName: file.name,
        fileSize: file.size,
        mimeType: "application/pdf",
        storagePath: uploadMeta.storagePath,
        downloadURL: uploadMeta.downloadURL,
        uploadedAt: serverTimestamp(),
        aiProvider: provider,
        parsed: true,
        parsedAt: serverTimestamp(),
        parsedData,
      });

      // Update user document
      await updateDoc(doc(db, "users", user.uid), {
        onboardingCompleted: true,
        selectedAIProvider: provider,
        resumeId: resumeRef.id,
        updatedAt: serverTimestamp(),
      });

      router.push("/dashboard/profile");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save. Please retry.";
      setError(message);
      setSaving(false);
    }
  }

  function handleReplace() {
    setFile(null);
    setParsedData(null);
    setUploadMeta(null);
    setError(null);
    setState("idle");
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[40%] flex-col justify-center px-12 xl:px-16 border-r border-border bg-card/30">
        <div className="max-w-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Getting Started
          </p>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            Upload your resume.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Upload your resume and we&apos;ll extract your profile, draft a
            cover letter, and queue jobs for you, usually in under a minute.
          </p>

          <div className="mt-10 space-y-5">
            <Feature
              icon={Sparkles}
              text="AI pulls your skills, roles, and dates straight from the PDF."
            />
            <Feature
              icon={FileText}
              text="A first-pass cover letter is written from your experience."
            />
            <Feature
              icon={Zap}
              text="Personalized matches ready by the time you finish setup."
            />
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex w-full lg:w-[60%] items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg space-y-8">
          <div className="lg:hidden">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Getting Started
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              Upload your resume.
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              PDF only, under 10MB. We parse it, draft a cover letter, and have
              matches waiting by the time you finish setup.
            </p>
          </div>

          <div className="hidden lg:block">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Resume
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              Upload your resume.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              PDF only, under 10MB. We parse it, draft a cover letter, and have
              matches waiting by the time you finish setup.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {(state === "idle" || state === "error") && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <ResumeDropzone onFileSelected={handleFileSelected} />

                <ProviderSelector
                  selected={provider}
                  onSelect={setProvider}
                />

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
                  >
                    {error}
                  </motion.div>
                )}

                <button
                  onClick={handleStart}
                  disabled={!file}
                  className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Upload &amp; Parse Resume
                </button>
              </motion.div>
            )}

            {state === "uploading" && file && (
              <motion.div
                key="uploading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <UploadProgressUI
                  progress={uploadProgress}
                  fileName={file.name}
                />
              </motion.div>
            )}

            {state === "parsing" && (
              <motion.div
                key="parsing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ParsingAnimation providerName={PROVIDER_NAMES[provider]} />
              </motion.div>
            )}

            {state === "success" && parsedData && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <OnboardingSuccess
                  data={parsedData}
                  onContinue={handleContinue}
                  onReplace={handleReplace}
                  loading={saving}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Feature({
  icon: Icon,
  text,
}: {
  icon: typeof Sparkles;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-green-500/10">
        <Check className="h-3 w-3 text-green-500" />
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}
