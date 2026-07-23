import { Briefcase } from "lucide-react";

interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/50 p-16 text-center space-y-4">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Briefcase className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">No jobs found</p>
        <p className="text-sm text-muted-foreground">
          {message || "Select platforms above and search to discover job opportunities."}
        </p>
      </div>
    </div>
  );
}
