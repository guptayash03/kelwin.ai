import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import {
  fetchActiveAtsJobs,
  fetchActiveJbJobs,
  fetchExpiredAtsIds,
  fetchExpiredJbIds,
  DEFAULT_ATS_PARAMS,
  DEFAULT_JB_PARAMS,
} from "@/lib/fantastic-jobs/client";
import {
  mapFantasticJobToCentralJob,
  buildUpdateFields,
} from "@/lib/fantastic-jobs/mapper";

export async function POST(request: Request) {
  const syncSecret = process.env.JOBS_SYNC_SECRET;
  if (!syncSecret) {
    return NextResponse.json({ error: "Sync not configured" }, { status: 500 });
  }

  const providedSecret = request.headers.get("x-sync-secret");
  if (providedSecret !== syncSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  let newCount = 0;
  let updatedCount = 0;
  let expiredCount = 0;
  const errors: string[] = [];

  try {
    // Fetch new jobs from both endpoints
    const [atsJobs, jbJobs] = await Promise.all([
      fetchActiveAtsJobs(DEFAULT_ATS_PARAMS).catch((err) => {
        errors.push(`active-ats: ${err.message}`);
        return [];
      }),
      fetchActiveJbJobs(DEFAULT_JB_PARAMS).catch((err) => {
        errors.push(`active-jb: ${err.message}`);
        return [];
      }),
    ]);

    const allJobs = [...atsJobs, ...jbJobs];

    // Upsert jobs in batches of 500
    const BATCH_SIZE = 500;
    for (let i = 0; i < allJobs.length; i += BATCH_SIZE) {
      const chunk = allJobs.slice(i, i + BATCH_SIZE);
      const batch = adminDb.batch();

      for (const raw of chunk) {
        const docId = String(raw.id);
        const docRef = adminDb.collection("centralJobs").doc(docId);
        const existing = await docRef.get();

        if (existing.exists) {
          batch.update(docRef, buildUpdateFields(raw));
          updatedCount++;
        } else {
          batch.set(docRef, mapFantasticJobToCentralJob(raw));
          newCount++;
        }
      }

      await batch.commit();
    }

    // Fetch and process expired jobs
    const [expiredAts, expiredJb] = await Promise.all([
      fetchExpiredAtsIds("1d").catch((err) => {
        errors.push(`expired-ats: ${err.message}`);
        return [];
      }),
      fetchExpiredJbIds("1d").catch((err) => {
        errors.push(`expired-jb: ${err.message}`);
        return [];
      }),
    ]);

    const expiredIds = [...expiredAts, ...expiredJb];

    for (let i = 0; i < expiredIds.length; i += BATCH_SIZE) {
      const chunk = expiredIds.slice(i, i + BATCH_SIZE);
      const batch = adminDb.batch();

      for (const id of chunk) {
        const docRef = adminDb.collection("centralJobs").doc(String(id));
        batch.update(docRef, {
          status: "expired",
          expiredAt: FieldValue.serverTimestamp(),
        });
        expiredCount++;
      }

      await batch.commit();
    }

    const duration = Date.now() - startTime;

    // Log sync run
    await adminDb.collection("syncRuns").add({
      timestamp: FieldValue.serverTimestamp(),
      durationMs: duration,
      newJobs: newCount,
      updatedJobs: updatedCount,
      expiredJobs: expiredCount,
      totalFetched: allJobs.length,
      errors,
    });

    return NextResponse.json({
      success: true,
      newJobs: newCount,
      updatedJobs: updatedCount,
      expiredJobs: expiredCount,
      totalFetched: allJobs.length,
      durationMs: duration,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Sync failed", details: message },
      { status: 500 }
    );
  }
}
