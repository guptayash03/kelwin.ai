import { NextResponse } from "next/server";

/**
 * @deprecated This endpoint has been replaced by the centralized jobs database.
 * Jobs are now synced daily from Fantastic.jobs and served from Firestore's
 * centralJobs collection. See /api/jobs/sync for the new sync endpoint.
 */
export async function POST() {
  return NextResponse.json(
    {
      error: "This endpoint is deprecated. Jobs are now loaded directly from the database.",
      migration: "The jobs page now reads from the centralJobs Firestore collection.",
    },
    { status: 410 }
  );
}
