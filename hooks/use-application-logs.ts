"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface ApplicationLog {
  id: string;
  timestamp: Date;
  level: "info" | "action" | "success" | "error" | "warning";
  message: string;
  step?: string;
}

export function useApplicationLogs(applicationId: string | null) {
  const [logs, setLogs] = useState<ApplicationLog[]>([]);

  useEffect(() => {
    if (!applicationId) {
      setLogs([]);
      return;
    }

    setLogs([]);

    const q = query(
      collection(db, "applications", applicationId, "logs"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const entries: ApplicationLog[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            timestamp: data.timestamp?.toDate?.() || new Date(),
            level: data.level || "info",
            message: data.message || "",
            step: data.step || undefined,
          };
        });
        setLogs(entries);
      },
      (err) => {
        console.error("Application logs snapshot error:", err);
      }
    );

    return () => unsubscribe();
  }, [applicationId]);

  return logs;
}
