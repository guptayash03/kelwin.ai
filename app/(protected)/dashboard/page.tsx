"use client";

import { useAuth } from "@/contexts/auth-context";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Welcome back, {user?.displayName || "there"}!
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Account</h3>
          <p className="mt-2 text-2xl font-bold text-foreground">Active</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
          <p className="mt-2 text-lg font-medium text-foreground truncate">
            {user?.email}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Provider</h3>
          <p className="mt-2 text-2xl font-bold text-foreground capitalize">
            {user?.providerData[0]?.providerId === "google.com"
              ? "Google"
              : "Email"}
          </p>
        </div>
      </div>
    </div>
  );
}
