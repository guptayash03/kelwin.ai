"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import type { PortalCredentialPublic } from "@/types/portal";

export function usePortalCredentials() {
  const { user } = useAuth();
  const [credentials, setCredentials] = useState<PortalCredentialPublic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCredentials([]);
      setLoading(false);
      return;
    }

    const colRef = collection(db, "users", user.uid, "portalCredentials");
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const creds: PortalCredentialPublic[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            portal: data.portal,
            email: data.email,
            connected: data.connected,
            updatedAt: data.updatedAt,
          };
        });
        setCredentials(creds);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  return { credentials, loading };
}
