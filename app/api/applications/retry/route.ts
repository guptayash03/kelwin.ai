import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeJwt } from "jose";
import { createApplicationTask } from "@/lib/cloud-tasks";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import type { ApplicationDocument, TaskType } from "@/types/application";

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

  let body: { applicationId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { applicationId } = body;
  if (!applicationId) {
    return NextResponse.json(
      { error: "Missing applicationId" },
      { status: 400 }
    );
  }

  try {
    const appDoc = await adminDb.collection("applications").doc(applicationId).get();

    if (!appDoc.exists) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const appData = appDoc.data() as ApplicationDocument;

    if (appData.userId !== uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (appData.status !== "failed") {
      return NextResponse.json(
        { error: "Only failed applications can be retried" },
        { status: 400 }
      );
    }

    const taskType: TaskType =
      appData.currentTaskType === "submission" ? "submission" : "analysis";

    await adminDb.collection("applications").doc(applicationId).update({
      status: "queued",
      currentTaskType: taskType,
      failureReason: null,
      retryCount: (appData.retryCount || 0) + 1,
      updatedAt: FieldValue.serverTimestamp(),
    });

    await createApplicationTask(applicationId, uid, taskType);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to retry application:", err);
    return NextResponse.json(
      { error: "Failed to retry application" },
      { status: 500 }
    );
  }
}
