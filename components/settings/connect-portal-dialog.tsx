"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import type { PortalId } from "@/types/portal";
import { SUPPORTED_PORTALS } from "@/types/portal";

interface ConnectPortalDialogProps {
  portal: PortalId | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConnectPortalDialog({
  portal,
  open,
  onOpenChange,
}: ConnectPortalDialogProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const portalInfo = SUPPORTED_PORTALS.find((p) => p.id === portal);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !portal) return;

    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken(true);
      document.cookie = `__session=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

      const res = await fetch("/api/portals/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portal, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to connect");
      }

      setEmail("");
      setPassword("");
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect {portalInfo?.name || portal}</DialogTitle>
          <DialogDescription>
            Enter your credentials for {portalInfo?.name}. Your password is
            encrypted and never stored in plaintext.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="portal-email">Email / Username</Label>
            <Input
              id="portal-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="portal-password">Password</Label>
            <Input
              id="portal-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your portal password"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Connecting..." : "Connect"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
