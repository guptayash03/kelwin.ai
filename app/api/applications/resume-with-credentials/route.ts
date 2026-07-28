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

  let body: { applicationId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { applicationId } = body;
  if (!applicationId) {
    return NextResponse.json(
      { error: "Missing required field: applicationId" },
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

    if (appData.status !== "waiting_for_credentials") {
      return NextResponse.json(
        { error: `Cannot resume: status is ${appData.status}` },
        { status: 409 }
      );
    }

    const portal = appData.detectedPortal;
    if (!portal) {
      return NextResponse.json(
        { error: "No portal detected for this application" },
        { status: 400 }
      );
    }

    // Verify credentials now exist
    const credDoc = await adminDb
      .collection("users")
      .doc(uid)
      .collection("portalCredentials")
      .doc(portal)
      .get();

    if (!credDoc.exists || !credDoc.data()?.connected) {
      return NextResponse.json(
        { error: `Credentials not found for ${portal}` },
        { status: 400 }
      );
    }

    await adminDb.collection("applications").doc(applicationId).update({
      status: "applying",
      currentTaskType: "login",
      updatedAt: FieldValue.serverTimestamp(),
    });

    await createApplicationTask(applicationId, uid, "login");

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Failed to resume: ${message}` },
      { status: 500 }
    );
  }
}
