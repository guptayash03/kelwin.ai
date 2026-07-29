"use client";

import { useState } from "react";
import { usePortalCredentials } from "@/hooks/use-portal-credentials";
import { PortalCard } from "@/components/settings/portal-card";
import { ConnectPortalDialog } from "@/components/settings/connect-portal-dialog";
import { SUPPORTED_PORTALS, type PortalId } from "@/types/portal";

export default function SettingsPage() {
  const { credentials, loading } = usePortalCredentials();
  const [connectPortal, setConnectPortal] = useState<PortalId | null>(null);

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Configure your account preferences.
        </p>
      </div>

      {/* Connected Job Portals */}
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Connected Job Portals</h3>
          <p className="text-sm text-muted-foreground">
            Save your credentials so the AI agent can log in and apply on your
            behalf. Passwords are encrypted and never stored in plaintext.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SUPPORTED_PORTALS.map((portal) => {
              const cred =
                credentials.find((c) => c.portal === portal.id) || null;
              return (
                <PortalCard
                  key={portal.id}
                  portalId={portal.id}
                  credential={cred}
                  onConnect={setConnectPortal}
                />
              );
            })}
          </div>
        )}
      </section>

      <ConnectPortalDialog
        portal={connectPortal}
        open={connectPortal !== null}
        onOpenChange={(open) => {
          if (!open) setConnectPortal(null);
        }}
      />
    </div>
  );
}
