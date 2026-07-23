"use client";

import { useState } from "react";
import type { NormalizedJob } from "@/types/job";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TopMatchesProps {
  jobs: NormalizedJob[];
  onApply: (url: string) => void;
}

const CARD_GRADIENTS = [
  "from-emerald-600 to-teal-700",
  "from-teal-600 to-cyan-700",
  "from-green-600 to-emerald-700",
  "from-cyan-700 to-teal-800",
  "from-emerald-700 to-green-800",
  "from-teal-700 to-emerald-800",
  "from-green-700 to-teal-800",
  "from-emerald-500 to-green-700",
];

const CARDS_PER_PAGE = 4;

export function TopMatches({ jobs, onApply }: TopMatchesProps) {
  const [currentPage, setCurrentPage] = useState(0);

  if (jobs.length === 0) return null;
  const topJobs = jobs.slice(0, 12);
  const totalPages = Math.ceil(topJobs.length / CARDS_PER_PAGE);
  const pageJobs = topJobs.slice(
    currentPage * CARDS_PER_PAGE,
    (currentPage + 1) * CARDS_PER_PAGE
  );

  function goTo(page: number) {
    setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">
          Top job matches
        </h3>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => goTo(currentPage - 1)}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => goTo(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Cards Grid - always 4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {pageJobs.map((job, i) => {
          const gradientIndex = currentPage * CARDS_PER_PAGE + i;
          return (
            <div
              key={job.id}
              className={`relative rounded-xl bg-gradient-to-br ${CARD_GRADIENTS[gradientIndex % CARD_GRADIENTS.length]} p-5 text-white overflow-hidden flex flex-col justify-between min-h-[160px]`}
            >
              {/* Match percentage circle */}
              <div className="absolute top-4 right-4">
                <div className="relative h-10 w-10">
                  <svg
                    className="h-full w-full -rotate-90"
                    viewBox="0 0 36 36"
                  >
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      strokeWidth="3"
                      className="stroke-white/20"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      strokeWidth="3"
                      strokeLinecap="round"
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
              <div className="pr-12">
                <p className="text-xs text-white/70 mb-1">{job.company}</p>
                <h4 className="text-sm font-semibold leading-tight line-clamp-2">
                  {job.title}
                </h4>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md overflow-hidden bg-white shrink-0 flex items-center justify-center">
                    <img
                      src={job.companyLogo}
                      alt={job.company}
                      className="h-6 w-6 object-contain"
                      onError={(e) => {
                        const el = e.target as HTMLImageElement;
                        const domain = job.companyLogo.split("/")[3]?.split("?")[0];
                        if (domain && !el.dataset.fallback) {
                          el.dataset.fallback = "1";
                          el.src = `https://img.logo.dev/${domain}?token=pk_anonymous&size=64`;
                        } else {
                          el.style.display = "none";
                          el.parentElement!.innerHTML = `<span class="text-[10px] font-bold text-emerald-800">${job.company.charAt(0)}</span>`;
                        }
                      }}
                    />
                  </div>
                  <span className="text-xs text-white/80">{job.company}</span>
                </div>
                <Button
                  variant="secondary"
                  size="xs"
                  className="bg-white text-emerald-800 hover:bg-white/90 border-0 text-xs font-medium"
                  onClick={() => onApply(job.applyUrl)}
                >
                  Apply
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Dots */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all ${
                i === currentPage
                  ? "w-5 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
