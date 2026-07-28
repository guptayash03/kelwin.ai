import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeJwt } from "jose";
import { adminDb } from "@/lib/firebase-admin";
import type { PortalCredentialPublic } from "@/types/portal";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
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

  try {
    const snapshot = await adminDb
      .collection("users")
      .doc(uid)
      .collection("portalCredentials")
      .get();

    const credentials: PortalCredentialPublic[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        portal: data.portal,
        email: data.email,
        connected: data.connected,
        updatedAt: data.updatedAt,
      };
    });

    return NextResponse.json({ credentials });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Failed to fetch credentials: ${message}` },
      { status: 500 }
    );
  }
}
