import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { cancelSubscription } from "@/lib/razorpay";

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

  try {
    const userDoc = await adminDb.collection("users").doc(uid).get();
    const userData = userDoc.data() || {};

    const subscriptionId = userData.razorpaySubscriptionId;
    if (!subscriptionId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    if (userData.subscriptionStatus !== "active") {
      return NextResponse.json(
        { error: `Cannot cancel: subscription is ${userData.subscriptionStatus}` },
        { status: 409 }
      );
    }

    await cancelSubscription(subscriptionId, true);

    await adminDb.collection("users").doc(uid).update({
      subscriptionStatus: "cancelling",
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Failed to cancel subscription:", message);
    return NextResponse.json(
      { error: `Failed to cancel subscription: ${message}` },
      { status: 500 }
    );
  }
}
