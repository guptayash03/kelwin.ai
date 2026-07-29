import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { encryptPassword } from "@/lib/encryption";
import { createApplicationTask } from "@/lib/cloud-tasks";
import { SUPPORTED_PORTALS } from "@/types/portal";

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

  let body: { portal?: string; email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { portal, email, password } = body;

  if (!portal || !email || !password) {
    return NextResponse.json(
      { error: "Missing required fields: portal, email, password" },
      { status: 400 }
    );
  }

  const validPortal = SUPPORTED_PORTALS.find((p) => p.id === portal);
  if (!validPortal) {
    return NextResponse.json({ error: "Unsupported portal" }, { status: 400 });
  }

  try {
    const { ciphertext, iv, authTag } = encryptPassword(password);

    await adminDb
      .collection("users")
      .doc(uid)
      .collection("portalCredentials")
      .doc(portal)
      .set({
        portal,
        email,
        encryptedPassword: ciphertext,
        iv,
        authTag,
        connected: true,
        updatedAt: FieldValue.serverTimestamp(),
      });

    // Auto-resume any applications waiting for this portal's credentials
    const pendingApps = await adminDb
      .collection("applications")
      .where("userId", "==", uid)
      .where("status", "==", "waiting_for_credentials")
      .where("detectedPortal", "==", portal)
      .get();

    for (const app of pendingApps.docs) {
      await adminDb.collection("applications").doc(app.id).update({
        status: "applying",
        currentTaskType: "login",
        updatedAt: FieldValue.serverTimestamp(),
      });
      await createApplicationTask(app.id, uid, "login");
    }

    return NextResponse.json({
      success: true,
      resumedApplications: pendingApps.size,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Failed to save credentials: ${message}` },
      { status: 500 }
    );
  }
}
