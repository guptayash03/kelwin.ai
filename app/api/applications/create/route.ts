import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeJwt } from "jose";
import { createApplicationTask } from "@/lib/cloud-tasks";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

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
      currentTaskType: "analysis",
      confirmationMessage: null,
      confirmationUrl: null,
      failureReason: null,
      retryCount: 0,
      detectedPortal: null,
      filledFieldValues: null,
      otpRequestedAt: null,
      otpPageUrl: null,
      sessionCookies: null,
      submittedAt: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await createApplicationTask(docRef.id, uid, "analysis");

    return NextResponse.json({
      applicationId: docRef.id,
      queued: false,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Failed to create application:", message);
    return NextResponse.json(
      { error: `Failed to create application: ${message}` },
      { status: 500 }
    );
  }
}
