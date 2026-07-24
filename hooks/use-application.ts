"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ApplicationDocument } from "@/types/application";

export function useApplication(applicationId: string | null) {
  const [application, setApplication] = useState<
    (ApplicationDocument & { id: string }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!applicationId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "applications", applicationId),
      (snapshot) => {
        if (snapshot.exists()) {
          setApplication({
            id: snapshot.id,
            ...(snapshot.data() as ApplicationDocument),
          });
        } else {
          setApplication(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Application snapshot error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [applicationId]);

  return { application, loading, error };
}
