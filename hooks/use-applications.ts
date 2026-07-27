"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import type { ApplicationDocument } from "@/types/application";
import { ACTIVE_STATUSES } from "@/types/application";

export function useApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<
    (ApplicationDocument & { id: string })[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "applications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const apps = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as ApplicationDocument),
        }));
        setApplications(apps);
        setLoading(false);
      },
      (err) => {
        console.error("Applications snapshot error:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const activeCount = applications.filter((a) =>
    ACTIVE_STATUSES.includes(a.status)
  ).length;

  const queuedCount = applications.filter((a) => a.status === "queued").length;
  const appliedCount = applications.filter((a) => a.status === "applied").length;
  const failedCount = applications.filter((a) => a.status === "failed").length;

  return {
    applications,
    loading,
    activeCount,
    queuedCount,
    appliedCount,
    failedCount,
  };
}
