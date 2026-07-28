"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface LimitReachedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LimitReachedModal({
  open,
  onOpenChange,
}: LimitReachedModalProps) {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            Daily Limit Reached
          </DialogTitle>
          <DialogDescription>
            You have used all 25 AI job applications for today. Your limit
            resets tomorrow.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 rounded-lg border bg-muted/50 p-4">
          <p className="text-sm font-medium">Upgrade to Unlimited</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Get unlimited AI job applications for just ₹199/month.
          </p>
        </div>
        <div className="mt-4 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Maybe Later
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              onOpenChange(false);
              router.push("/dashboard/billing");
            }}
          >
            Upgrade Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
