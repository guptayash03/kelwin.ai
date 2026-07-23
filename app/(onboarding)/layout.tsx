"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/sign-in");
      return;
    }

    if (!loading && user) {
      const check = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const data = userDoc.data();
          if (data?.onboardingCompleted) {
            router.replace("/dashboard");
            return;
          }
        } catch {
          // If we can't check, allow access to onboarding
        }
        setReady(true);
      };
      check();
    }
  }, [user, loading, router]);

  if (loading || !user || !ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
