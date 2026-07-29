import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
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
    const decoded = await adminAuth.verifyIdToken(session);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  let body: { applicationId?: string; editedFields?: Record<string, string> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { applicationId, editedFields } = body;
  if (!applicationId) {
    return NextResponse.json(
      { error: "Missing required field: applicationId" },
      { status: 400 }
    );
  }

  try {
    const appRef = adminDb.collection("applications").doc(applicationId);

    const transitioned = await adminDb.runTransaction(async (tx) => {
      const appDoc = await tx.get(appRef);

      if (!appDoc.exists) return { error: "Application not found", status: 404 };

      const appData = appDoc.data()!;
      if (appData.userId !== uid) return { error: "Forbidden", status: 403 };

      if (appData.status !== "waiting_for_review") {
        return { error: `Cannot confirm: status is ${appData.status}`, status: 409 };
      }

      const updateData: Record<string, unknown> = {
        status: "submitting",
        currentTaskType: "final_submit",
        updatedAt: FieldValue.serverTimestamp(),
      };

      if (editedFields && Object.keys(editedFields).length > 0) {
        const existing = appData.filledFieldValues || {};
        updateData.filledFieldValues = { ...existing, ...editedFields };
      }

      tx.update(appRef, updateData);
      return { success: true };
    });

    if ("error" in transitioned) {
      return NextResponse.json(
        { error: transitioned.error },
        { status: transitioned.status }
      );
    }

    try {
      await createApplicationTask(applicationId, uid, "final_submit");
    } catch (taskErr) {
      await appRef.update({
        status: "waiting_for_review",
        currentTaskType: null,
        updatedAt: FieldValue.serverTimestamp(),
      });
      const message = taskErr instanceof Error ? taskErr.message : String(taskErr);
      return NextResponse.json(
        { error: `Failed to enqueue task: ${message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Failed to confirm submission: ${message}` },
      { status: 500 }
    );
  }
}
