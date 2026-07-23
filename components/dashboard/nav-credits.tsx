"use client";

import { Progress } from "@/components/ui/progress";
import { Sparkles } from "lucide-react";

export function NavCredits() {
  return (
    <div className="mx-2 rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-3 group-data-[collapsible=icon]:hidden">
      <div className="flex items-center gap-2 text-xs font-medium text-sidebar-foreground">
        <Sparkles className="size-3.5" />
        <span>Credits</span>
        <span className="ml-auto text-muted-foreground">23/50</span>
      </div>
      <Progress value={46} className="mt-2" />
      <p className="mt-1.5 text-[11px] text-muted-foreground">
        Resets in 8 days
      </p>
    </div>
  );
}
