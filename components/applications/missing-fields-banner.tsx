"use client";

import { useApplications } from "@/hooks/use-applications";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export function MissingFieldsBanner() {
  const { applications } = useApplications();

  const missingApps = applications.filter(
    (app) => app.status === "missing_profile_info"
  );

  if (missingApps.length === 0) return null;

  const allMissingFields = [
    ...new Set(missingApps.flatMap((app) => app.missingFields)),
  ];

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
      <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium text-amber-800">
          {missingApps.length} application{missingApps.length > 1 ? "s" : ""}{" "}
          waiting for profile info
        </p>
        {allMissingFields.length > 0 && (
          <p className="text-xs text-amber-700 mt-1">
            Missing: {allMissingFields.slice(0, 5).join(", ")}
            {allMissingFields.length > 5 &&
              ` and ${allMissingFields.length - 5} more`}
          </p>
        )}
        <p className="text-xs text-amber-600 mt-1">
          Complete these fields below, then resume your applications.
        </p>
      </div>
      <Link href="/dashboard/applications">
        <Button variant="outline" size="xs" className="shrink-0">
          View Applications
        </Button>
      </Link>
    </div>
  );
}
