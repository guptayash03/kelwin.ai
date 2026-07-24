import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeJwt } from "jose";
import { createApplicationTask } from "@/lib/cloud-tasks";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import type { ApplicationDocument } from "@/types/application";

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

    if (appData.status !== "missing_profile_info") {
      return NextResponse.json(
        { error: "Application is not in missing_profile_info status" },
        { status: 400 }
      );
    }

    await adminDb.collection("applications").doc(applicationId).update({
      status: "ready_to_apply",
      currentTaskType: "submission",
      missingFields: [],
      updatedAt: FieldValue.serverTimestamp(),
    });

    await createApplicationTask(applicationId, uid, "submission");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to resume application:", err);
    return NextResponse.json(
      { error: "Failed to resume application" },
      { status: 500 }
    );
  }
}
