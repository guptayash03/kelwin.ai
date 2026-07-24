import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeJwt } from "jose";
import { createApplicationTask } from "@/lib/cloud-tasks";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { ACTIVE_STATUSES } from "@/types/application";

export async function POST(request: NextRequest) {
  const session = request.cookies.get("__session")?.value;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let uid: string;
  try {
    const payload = decodeJwt(session);
    uid = payload.sub as string;
    if (!uid) throw new Error("No uid in token");
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  let body: {
    jobId?: string;
    jobUrl?: string;
    jobTitle?: string;
    company?: string;
    companyLogo?: string;
    platform?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { jobId, jobUrl, jobTitle, company, companyLogo, platform } = body;

  if (!jobId || !jobUrl || !jobTitle || !company || !platform) {
    return NextResponse.json(
      { error: "Missing required fields: jobId, jobUrl, jobTitle, company, platform" },
      { status: 400 }
    );
  }

  try {
    const activeSnapshot = await adminDb
      .collection("applications")
      .where("userId", "==", uid)
      .where("status", "in", ACTIVE_STATUSES)
      .limit(1)
      .get();

    const hasActive = !activeSnapshot.empty;

    const docRef = await adminDb.collection("applications").add({
      userId: uid,
      jobId,
      jobUrl,
      jobTitle,
      company,
      companyLogo: companyLogo || "",
      platform,
      status: "queued",
      detectedFields: [],
      screeningQuestions: [],
      missingFields: [],
      currentTaskType: hasActive ? null : "analysis",
      confirmationMessage: null,
      confirmationUrl: null,
      failureReason: null,
      retryCount: 0,
      submittedAt: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    if (!hasActive) {
      await createApplicationTask(docRef.id, uid, "analysis");
    }

    return NextResponse.json({
      applicationId: docRef.id,
      queued: hasActive,
    });
  } catch (err) {
    console.error("Failed to create application:", err);
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}
