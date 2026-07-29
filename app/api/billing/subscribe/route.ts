import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { createSubscription } from "@/lib/razorpay";
import { getRazorpayPlanId } from "@/config/plans";

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

  let body: { planId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { planId } = body;
  if (planId !== "unlimited") {
    return NextResponse.json(
      { error: "Invalid plan. Only 'unlimited' is available for subscription." },
      { status: 400 }
    );
  }

  const razorpayPlanId = getRazorpayPlanId("unlimited");
  if (!razorpayPlanId) {
    return NextResponse.json(
      { error: "Razorpay plan not configured" },
      { status: 500 }
    );
  }

  try {
    const userDoc = await adminDb.collection("users").doc(uid).get();
    const userData = userDoc.data() || {};
    const email = userData.email || "";

    if (userData.subscriptionStatus === "active" && userData.currentPlan === "unlimited") {
      return NextResponse.json(
        { error: "Already subscribed to Unlimited plan" },
        { status: 409 }
      );
    }

    const subscription = await createSubscription(razorpayPlanId, email, uid);

    await adminDb.collection("users").doc(uid).update({
      razorpaySubscriptionId: subscription.id,
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Failed to create subscription:", message);
    return NextResponse.json(
      { error: `Failed to create subscription: ${message}` },
      { status: 500 }
    );
  }
}
