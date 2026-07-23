"use client";

import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { UploadProgress as UploadProgressType } from "@/lib/resume-upload";

interface UploadProgressProps {
  progress: UploadProgressType;
  fileName: string;
}

export function UploadProgress({ progress, fileName }: UploadProgressProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-6 space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {fileName}
          </p>
          <p className="text-xs text-muted-foreground">
            Uploading... {progress.percentage}%
          </p>
        </div>
      </div>
      <Progress value={progress.percentage} />
      <p className="text-xs text-muted-foreground text-right">
        {(progress.bytesTransferred / (1024 * 1024)).toFixed(1)} /{" "}
        {(progress.totalBytes / (1024 * 1024)).toFixed(1)} MB
      </p>
    </motion.div>
  );
}
