"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/sign-in");
      return;
    }

    if (!loading && user) {
      const checkOnboarding = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const data = userDoc.data();
          if (!data?.onboardingCompleted) {
            router.replace("/onboarding");
            return;
          }
        } catch {
          // If check fails, allow access (don't block returning users)
        }
        setCheckingOnboarding(false);
      };
      checkOnboarding();
    }
  }, [user, loading, router]);

  if (loading || !user || checkingOnboarding) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset>
          <DashboardHeader />
          <main className="flex-1 p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
