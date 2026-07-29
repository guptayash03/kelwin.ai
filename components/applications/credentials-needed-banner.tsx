"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { KeyRound, ArrowRight } from "lucide-react";
import { ConnectPortalDialog } from "@/components/settings/connect-portal-dialog";
import { SUPPORTED_PORTALS, type PortalId } from "@/types/portal";
import { useAuth } from "@/contexts/auth-context";

interface CredentialsNeededBannerProps {
  applicationId: string;
  portal: string | null;
}

export function CredentialsNeededBanner({
  applicationId,
  portal,
}: CredentialsNeededBannerProps) {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);

  const portalInfo = SUPPORTED_PORTALS.find((p) => p.id === portal);
  const portalName = portalInfo?.name || portal || "the job portal";

  return (
    <>
      <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-5">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
            <KeyRound className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-amber-900 dark:text-amber-200">
              Portal Connection Required
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              {portalName} requires login credentials to continue. Connect your
              account and the application will resume automatically.
            </p>
            <Button
              className="mt-3"
              size="sm"
              onClick={() => setDialogOpen(true)}
            >
              <KeyRound className="h-3.5 w-3.5" />
              Connect {portalName}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <ConnectPortalDialog
        portal={(portal as PortalId) || null}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
