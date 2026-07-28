"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { ShieldCheck, Clock } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface OtpDialogProps {
  applicationId: string;
  otpRequestedAt?: unknown;
}

export function OtpDialog({ applicationId, otpRequestedAt }: OtpDialogProps) {
  const { user } = useAuth();
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!user || otpCode.length < 4) return;

    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken(true);
      document.cookie = `__session=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

      const res = await fetch("/api/applications/submit-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, otpCode }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit OTP");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900 p-5">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
          <ShieldCheck className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-200">
            Verification Code Required
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            The portal sent a verification code to your email or phone. Enter it
            below to continue.
          </p>

          <div className="mt-4 flex items-center gap-3">
            <InputOTP
              maxLength={6}
              value={otpCode}
              onChange={setOtpCode}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {error && (
            <p className="text-sm text-destructive mt-2">{error}</p>
          )}

          <div className="flex items-center gap-3 mt-4">
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={loading || otpCode.length < 4}
            >
              {loading ? "Verifying..." : "Submit Code"}
            </Button>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Code expires in a few minutes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
