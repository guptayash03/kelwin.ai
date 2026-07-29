import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
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

  let body: { portal?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { portal } = body;
  if (!portal) {
    return NextResponse.json(
      { error: "Missing required field: portal" },
      { status: 400 }
    );
  }

  const validPortal = SUPPORTED_PORTALS.find((p) => p.id === portal);
  if (!validPortal) {
    return NextResponse.json({ error: "Unsupported portal" }, { status: 400 });
  }

  try {
    await adminDb
      .collection("users")
      .doc(uid)
      .collection("portalCredentials")
      .doc(portal)
      .delete();

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Failed to disconnect: ${message}` },
      { status: 500 }
    );
  }
}
