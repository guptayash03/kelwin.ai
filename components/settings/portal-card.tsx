"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Link2Off } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import type { PortalCredentialPublic, PortalId } from "@/types/portal";
import { SUPPORTED_PORTALS } from "@/types/portal";

interface PortalCardProps {
  portalId: PortalId;
  credential: PortalCredentialPublic | null;
  onConnect: (portalId: PortalId) => void;
}

export function PortalCard({ portalId, credential, onConnect }: PortalCardProps) {
  const { user } = useAuth();
  const [disconnecting, setDisconnecting] = useState(false);
  const [imgError, setImgError] = useState(false);
  const portalInfo = SUPPORTED_PORTALS.find((p) => p.id === portalId)!;

  async function handleDisconnect() {
    if (!user) return;
    setDisconnecting(true);

    try {
      const token = await user.getIdToken(true);
      document.cookie = `__session=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

      await fetch("/api/portals/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portal: portalId }),
      });
    } catch {
      // UI updates via realtime listener
    } finally {
      setDisconnecting(false);
    }
  }

  const isConnected = credential?.connected;
  const logoUrl = `https://www.google.com/s2/favicons?domain=${portalInfo.domain}&sz=64`;

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-white border border-border flex items-center justify-center overflow-hidden shrink-0">
            {!imgError ? (
              <img
                src={logoUrl}
                alt={portalInfo.name}
                className="h-7 w-7 object-contain"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="text-sm font-bold text-muted-foreground">
                {portalInfo.name.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <p className="font-medium text-sm">{portalInfo.name}</p>
            <p className="text-xs text-muted-foreground">{portalInfo.domain}</p>
          </div>
        </div>
        {isConnected ? (
          <Badge variant="default" className="gap-1 bg-green-600 text-xs">
            <CheckCircle2 className="h-3 w-3" />
            Connected
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">
            Not Connected
          </Badge>
        )}
      </div>

      {isConnected && credential && (
        <p className="text-xs text-muted-foreground">
          Signed in as {credential.email}
        </p>
      )}

      <div className="flex gap-2 mt-auto">
        {isConnected ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="w-full"
          >
            <Link2Off className="h-3.5 w-3.5" />
            {disconnecting ? "Disconnecting..." : "Disconnect"}
          </Button>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={() => onConnect(portalId)}
            className="w-full"
          >
            Connect
          </Button>
        )}
      </div>
    </div>
  );
}
