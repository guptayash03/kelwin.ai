import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeJwt } from "jose";
import { checkSubscription } from "@/lib/subscription";

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
    const status = await checkSubscription(uid);
    return NextResponse.json(status);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Failed to get billing status: ${message}` },
      { status: 500 }
    );
  }
}
