import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeJwt } from "jose";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { createApplicationTask } from "@/lib/cloud-tasks";

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

  let body: { applicationId?: string; otpCode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { applicationId, otpCode } = body;
  if (!applicationId || !otpCode) {
    return NextResponse.json(
      { error: "Missing required fields: applicationId, otpCode" },
      { status: 400 }
    );
  }

  try {
    const appDoc = await adminDb
      .collection("applications")
      .doc(applicationId)
      .get();

    if (!appDoc.exists) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const appData = appDoc.data()!;
    if (appData.userId !== uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (appData.status !== "waiting_for_otp") {
      return NextResponse.json(
        { error: `Cannot submit OTP: status is ${appData.status}` },
        { status: 409 }
      );
    }

    // Determine which task to dispatch based on where the OTP was requested
    // If the app already has filledFieldValues, it means the form was filled and
    // the OTP is a post-submit verification code → route to final_submit
    const isPostSubmitVerification = !!appData.filledFieldValues;
    const taskType = isPostSubmitVerification ? "final_submit" : "login";

    await adminDb.collection("applications").doc(applicationId).update({
      status: isPostSubmitVerification ? "submitting" : "applying",
      currentTaskType: taskType,
      updatedAt: FieldValue.serverTimestamp(),
    });

    await createApplicationTask(applicationId, uid, taskType, {
      otpCode,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Failed to submit OTP: ${message}` },
      { status: 500 }
    );
  }
}
