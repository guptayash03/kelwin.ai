import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import {
  fetchActiveAtsJobs,
  fetchActiveJbJobs,
  DEFAULT_ATS_PARAMS,
  DEFAULT_JB_PARAMS,
} from "@/lib/fantastic-jobs/client";
import { mapFantasticJobToCentralJob } from "@/lib/fantastic-jobs/mapper";

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
  let totalWritten = 0;
  let skippedExisting = 0;

  try {
    const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const [atsJobs, jbJobs] = await Promise.all([
      fetchActiveAtsJobs({
        ...DEFAULT_ATS_PARAMS,
        time_frame: "24h",
        date_created_gte: oneDayAgo,
      }),
      fetchActiveJbJobs({
        ...DEFAULT_JB_PARAMS,
        time_frame: "24h",
        date_created_gte: oneDayAgo,
      }),
    ]);

    const allJobs = [...atsJobs, ...jbJobs];

    // Write in batches of 500, skip existing docs
    const BATCH_SIZE = 500;
    for (let i = 0; i < allJobs.length; i += BATCH_SIZE) {
      const chunk = allJobs.slice(i, i + BATCH_SIZE);
      const batch = adminDb.batch();
      let batchOps = 0;

      for (const raw of chunk) {
        const docId = String(raw.id);
        const docRef = adminDb.collection("centralJobs").doc(docId);
        const existing = await docRef.get();

        if (existing.exists) {
          skippedExisting++;
          continue;
        }

        batch.set(docRef, mapFantasticJobToCentralJob(raw));
        batchOps++;
        totalWritten++;
      }

      if (batchOps > 0) {
        await batch.commit();
      }
    }

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      totalFetched: allJobs.length,
      totalWritten,
      skippedExisting,
      durationMs: duration,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Backfill failed", details: message },
      { status: 500 }
    );
  }
}
