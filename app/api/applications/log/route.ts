import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.JOBS_SYNC_SECRET;

  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    applicationId?: string;
    level?: string;
    message?: string;
    step?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { applicationId, level, message, step } = body;

  if (!applicationId || !message) {
    return NextResponse.json(
      { error: "Missing required fields: applicationId, message" },
      { status: 400 }
    );
  }

  const validLevels = ["info", "action", "success", "error", "warning"];
  const logLevel = validLevels.includes(level || "") ? level : "info";

  try {
    await adminDb
      .collection("applications")
      .doc(applicationId)
      .collection("logs")
      .add({
        level: logLevel,
        message,
        step: step || null,
        timestamp: FieldValue.serverTimestamp(),
      });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("Failed to write application log:", errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
