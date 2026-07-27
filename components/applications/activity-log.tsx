"use client";

import { useEffect, useRef } from "react";
import {
  Terminal,
  CheckCircle2,
  AlertCircle,
  Circle,
  Zap,
  AlertTriangle,
} from "lucide-react";
import type { ApplicationLog } from "@/hooks/use-application-logs";
import type { ApplicationStatus } from "@/types/application";

interface ActivityLogProps {
  logs: ApplicationLog[];
  status: ApplicationStatus;
}

const LEVEL_CONFIG = {
  info: { icon: Circle, color: "text-sky-400", bg: "bg-sky-400/10" },
  action: { icon: Zap, color: "text-amber-300", bg: "bg-amber-300/10" },
  success: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  error: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-400/10" },
  warning: { icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-400/10" },
} as const;

/**
 * Formats a date as a 24-hour time string.
 *
 * @param date - The date to format
 * @returns The localized time in `HH:MM:SS` format
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

/**
 * Renders an activity log panel with status-aware live indicators and automatic scrolling.
 *
 * @param logs - The activity entries to display.
 * @param status - The current application status used to determine whether processing is ongoing.
 */
export function ActivityLog({ logs, status }: ActivityLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const isProcessing = !["applied", "failed", "queued", "missing_profile_info"].includes(status);

  return (
    <div className="rounded-xl border border-zinc-800 overflow-hidden flex flex-col h-full bg-[#0d1117] shadow-xl">
      {/* Header bar */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-zinc-800 bg-[#161b22]">
        {/* macOS-style dots */}
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 flex items-center justify-center gap-1.5">
          <Terminal className="h-3.5 w-3.5 text-zinc-500" />
          <span className="text-xs font-medium text-zinc-400">Activity Log</span>
        </div>
        {isProcessing && (
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">Live</span>
          </span>
        )}
      </div>

      {/* Log body */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5 min-h-[300px] max-h-[500px] font-mono text-[11px] leading-relaxed"
      >
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-zinc-600">
            <Terminal className="h-8 w-8 opacity-40" />
            <p className="text-xs">
              {isProcessing
                ? "Waiting for activity..."
                : "No activity recorded for this application."}
            </p>
          </div>
        ) : (
          logs.map((log) => {
            const config = LEVEL_CONFIG[log.level];
            const Icon = config.icon;
            return (
              <div
                key={log.id}
                className={`flex items-start gap-2.5 py-1.5 px-2.5 rounded-md ${config.bg} transition-colors`}
              >
                <span className="text-zinc-600 shrink-0 select-none tabular-nums">
                  {formatTime(log.timestamp)}
                </span>
                <Icon className={`h-3.5 w-3.5 shrink-0 mt-[1px] ${config.color}`} />
                <span className="text-zinc-300 break-words flex-1">
                  {log.message}
                </span>
              </div>
            );
          })
        )}

        {/* Blinking cursor when processing */}
        {isProcessing && logs.length > 0 && (
          <div className="flex items-center gap-2.5 py-1.5 px-2.5">
            <span className="text-zinc-600 select-none tabular-nums">
              {formatTime(new Date())}
            </span>
            <span className="inline-block w-[6px] h-4 bg-emerald-400/80 rounded-[1px] animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}
