"use client";

import { Progress } from "@/components/ui/progress";
import { Sparkles, Infinity } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";

export function NavCredits() {
  const { currentPlan, dailyUsage, dailyLimit, loading } = useSubscription();

  if (loading) {
    return (
      <div className="mx-2 rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-3 group-data-[collapsible=icon]:hidden">
        <div className="h-10 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  const isUnlimited = dailyLimit === null;
  const percentage = isUnlimited ? 0 : Math.round((dailyUsage / dailyLimit) * 100);

  return (
    <div className="mx-2 rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-3 group-data-[collapsible=icon]:hidden">
      <div className="flex items-center gap-2 text-xs font-medium text-sidebar-foreground">
        <Sparkles className="size-3.5" />
        <span>Daily Applies</span>
        {isUnlimited ? (
          <span className="ml-auto flex items-center gap-1 text-muted-foreground">
            <Infinity className="size-3" />
          </span>
        ) : (
          <span className="ml-auto text-muted-foreground">
            {dailyUsage}/{dailyLimit}
          </span>
        )}
      </div>
      {!isUnlimited && <Progress value={percentage} className="mt-2" />}
      <p className="mt-1.5 text-[11px] text-muted-foreground">
        {isUnlimited
          ? "Unlimited plan"
          : `${currentPlan === "pro" ? "Pro" : ""} plan · Resets daily`}
      </p>
    </div>
  );
}
