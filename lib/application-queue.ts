import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ACTIVE_STATUSES, TERMINAL_STATUSES } from "@/types/application";
import type { ApplicationDocument } from "@/types/application";

export async function hasActiveApplication(userId: string): Promise<boolean> {
  const q = query(
    collection(db, "applications"),
    where("userId", "==", userId),
    where("status", "in", ACTIVE_STATUSES),
    limit(1)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

export async function getNextQueuedApplication(
  userId: string
): Promise<{ id: string; data: ApplicationDocument } | null> {
  const q = query(
    collection(db, "applications"),
    where("userId", "==", userId),
    where("status", "==", "queued"),
    orderBy("createdAt", "asc"),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, data: doc.data() as ApplicationDocument };
}

export async function getQueuePosition(
  userId: string,
  applicationId: string
): Promise<number> {
  const q = query(
    collection(db, "applications"),
    where("userId", "==", userId),
    where("status", "==", "queued"),
    orderBy("createdAt", "asc")
  );
  const snapshot = await getDocs(q);
  const index = snapshot.docs.findIndex((d) => d.id === applicationId);
  return index === -1 ? -1 : index + 1;
}

export async function getUserApplicationStats(userId: string) {
  const q = query(
    collection(db, "applications"),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);

  let queued = 0;
  let active = 0;
  let applied = 0;
  let failed = 0;

  snapshot.docs.forEach((doc) => {
    const status = doc.data().status;
    if (status === "queued") queued++;
    else if (ACTIVE_STATUSES.includes(status)) active++;
    else if (status === "applied") applied++;
    else if (status === "failed") failed++;
  });

  return { total: snapshot.size, queued, active, applied, failed };
}
