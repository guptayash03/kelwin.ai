"use client";

import { Check } from "lucide-react";

export function AuthPanel() {
  return (
    <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-[#1a1a1a] px-12 py-10">
      <a href="https://kelwin.app" className="flex items-center gap-2">
        <svg
          className="h-7 w-7 text-white"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2L2 19h20L12 2zm0 4l7 11H5l7-11z" />
        </svg>
        <span className="text-xl font-semibold text-white tracking-tight">
          Kelwin
        </span>
      </a>

      <div className="flex flex-col gap-8">
        <div className="space-y-6">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/50">
            Made by people who needed it
          </p>
          <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-white">
            AI Agent for
            <br />
            <span className="bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              High Paying
            </span>{" "}
            SDE Roles
          </h1>
          <p className="max-w-md text-[15px] leading-relaxed text-white/60">
            We applied to 3,000 jobs by hand, and the job hunt broke us. With
            Kelwin, you apply to zero. We do three things really well:
          </p>
        </div>

        <div className="h-px bg-white/10" />

        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
            <span className="text-[15px] text-white/80">
              Match you with 2M+ jobs that fit you
            </span>
          </div>
          <div className="flex items-start gap-3">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
            <span className="text-[15px] text-white/80">
              Optimize your résumé and write a custom cover letter for each
            </span>
          </div>
          <div className="flex items-start gap-3">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
            <span className="text-[15px] text-white/80">
              Actually apply to them{" "}
              <span className="text-white/50">
                (we even create your Workday accounts!)
              </span>
            </span>
          </div>
        </div>
      </div>

      <div />
    </div>
  );
}
