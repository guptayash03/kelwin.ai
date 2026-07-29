import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { verifyWebhookSignature } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!WEBHOOK_SECRET) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const signature = request.headers.get("x-razorpay-signature") || "";
  const rawBody = await request.text();

  if (!verifyWebhookSignature(rawBody, signature, WEBHOOK_SECRET)) {
    console.error("Razorpay webhook signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = event.event;
  const payload = event.payload;

  try {
    switch (eventType) {
      case "subscription.activated": {
        const sub = payload.subscription.entity;
        const userId = sub.notes?.userId;
        if (!userId) break;

        await adminDb.collection("users").doc(userId).update({
          currentPlan: "unlimited",
          subscriptionStatus: "active",
          razorpaySubscriptionId: sub.id,
          razorpayCustomerId: sub.customer_id || null,
          currentPeriodStart: sub.current_start
            ? new Date(sub.current_start * 1000)
            : null,
          currentPeriodEnd: sub.current_end
            ? new Date(sub.current_end * 1000)
            : null,
          paymentStatus: "captured",
          updatedAt: FieldValue.serverTimestamp(),
        });

        await adminDb.collection("subscriptions").doc(sub.id).set({
          userId,
          plan: "unlimited",
          amount: 199,
          currency: "INR",
          interval: "monthly",
          status: "active",
          razorpayCustomerId: sub.customer_id || null,
          razorpaySubscriptionId: sub.id,
          currentPeriodStart: sub.current_start
            ? new Date(sub.current_start * 1000)
            : null,
          currentPeriodEnd: sub.current_end
            ? new Date(sub.current_end * 1000)
            : null,
          cancelledAt: null,
          createdAt: FieldValue.serverTimestamp(),
        });
        break;
      }

      case "subscription.charged": {
        const sub = payload.subscription.entity;
        const payment = payload.payment?.entity;
        const userId = sub.notes?.userId;
        if (!userId) break;

        await adminDb.collection("users").doc(userId).update({
          currentPeriodStart: sub.current_start
            ? new Date(sub.current_start * 1000)
            : null,
          currentPeriodEnd: sub.current_end
            ? new Date(sub.current_end * 1000)
            : null,
          paymentStatus: "captured",
          updatedAt: FieldValue.serverTimestamp(),
        });

        if (sub.id) {
          await adminDb.collection("subscriptions").doc(sub.id).update({
            currentPeriodStart: sub.current_start
              ? new Date(sub.current_start * 1000)
              : null,
            currentPeriodEnd: sub.current_end
              ? new Date(sub.current_end * 1000)
              : null,
            status: "active",
          });
        }

        if (payment) {
          await adminDb.collection("billingHistory").add({
            userId,
            paymentId: payment.id,
            subscriptionId: sub.id,
            invoiceId: payment.invoice_id || null,
            amount: payment.amount / 100,
            currency: payment.currency?.toUpperCase() || "INR",
            paymentMethod: payment.method || "unknown",
            status: "captured",
            createdAt: FieldValue.serverTimestamp(),
          });
        }
        break;
      }

      case "subscription.completed":
      case "subscription.cancelled": {
        const sub = payload.subscription.entity;
        const userId = sub.notes?.userId;
        if (!userId) break;

        await adminDb.collection("users").doc(userId).update({
          currentPlan: "pro",
          subscriptionStatus: "cancelled",
          currentPeriodStart: null,
          currentPeriodEnd: null,
          paymentStatus: null,
          updatedAt: FieldValue.serverTimestamp(),
        });

        if (sub.id) {
          await adminDb.collection("subscriptions").doc(sub.id).update({
            status: "cancelled",
            cancelledAt: FieldValue.serverTimestamp(),
          });
        }
        break;
      }

      case "subscription.paused": {
        const sub = payload.subscription.entity;
        const userId = sub.notes?.userId;
        if (!userId) break;

        await adminDb.collection("users").doc(userId).update({
          subscriptionStatus: "paused",
          updatedAt: FieldValue.serverTimestamp(),
        });

        if (sub.id) {
          await adminDb.collection("subscriptions").doc(sub.id).update({
            status: "paused",
          });
        }
        break;
      }

      case "subscription.resumed": {
        const sub = payload.subscription.entity;
        const userId = sub.notes?.userId;
        if (!userId) break;

        await adminDb.collection("users").doc(userId).update({
          subscriptionStatus: "active",
          updatedAt: FieldValue.serverTimestamp(),
        });

        if (sub.id) {
          await adminDb.collection("subscriptions").doc(sub.id).update({
            status: "active",
          });
        }
        break;
      }

      case "payment.captured": {
        const payment = payload.payment.entity;
        const userId = payment.notes?.userId;
        if (!userId) break;

        const existingPayment = await adminDb
          .collection("billingHistory")
          .where("paymentId", "==", payment.id)
          .limit(1)
          .get();

        if (existingPayment.empty) {
          await adminDb.collection("billingHistory").add({
            userId,
            paymentId: payment.id,
            subscriptionId: payment.subscription_id || null,
            invoiceId: payment.invoice_id || null,
            amount: payment.amount / 100,
            currency: payment.currency?.toUpperCase() || "INR",
            paymentMethod: payment.method || "unknown",
            status: "captured",
            createdAt: FieldValue.serverTimestamp(),
          });
        }
        break;
      }

      case "payment.failed": {
        const payment = payload.payment.entity;
        const userId = payment.notes?.userId;
        if (!userId) break;

        await adminDb.collection("users").doc(userId).update({
          paymentStatus: "failed",
          updatedAt: FieldValue.serverTimestamp(),
        });
        break;
      }

      default:
        console.log(`Unhandled Razorpay webhook event: ${eventType}`);
    }
  } catch (err) {
    console.error(`Error processing webhook ${eventType}:`, err);
    return NextResponse.json(
      { error: `Failed to process ${eventType}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
