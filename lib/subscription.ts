import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { PLANS, type PlanId } from "@/config/plans";

function getTodayKey(userId: string): string {
  const today = new Date().toISOString().split("T")[0];
  return `${userId}_${today}`;
}

export interface SubscriptionStatus {
  currentPlan: PlanId;
  subscriptionStatus: string | null;
  dailyUsage: number;
  dailyLimit: number | null;
  canApply: boolean;
  remainingToday: number | null;
}

export async function checkSubscription(
  userId: string
): Promise<SubscriptionStatus> {
  const userDoc = await adminDb.collection("users").doc(userId).get();
  const userData = userDoc.data() || {};

  const currentPlan: PlanId = userData.currentPlan || "pro";
  const subscriptionStatus = userData.subscriptionStatus || null;
  const plan = PLANS[currentPlan];
  const dailyLimit = plan.dailyLimit;

  const usageDoc = await adminDb
    .collection("dailyUsage")
    .doc(getTodayKey(userId))
    .get();

  const dailyUsage = usageDoc.exists
    ? usageDoc.data()?.aiApplyCount || 0
    : 0;

  let canApply = true;
  let remainingToday: number | null = null;

  if (dailyLimit !== null) {
    remainingToday = Math.max(0, dailyLimit - dailyUsage);
    canApply = dailyUsage < dailyLimit;
  }

  return {
    currentPlan,
    subscriptionStatus,
    dailyUsage,
    dailyLimit,
    canApply,
    remainingToday,
  };
}

export async function incrementDailyUsage(userId: string): Promise<void> {
  const docKey = getTodayKey(userId);
  const today = new Date().toISOString().split("T")[0];
  const docRef = adminDb.collection("dailyUsage").doc(docKey);

  const doc = await docRef.get();
  if (doc.exists) {
    await docRef.update({
      aiApplyCount: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    });
  } else {
    const userDoc = await adminDb.collection("users").doc(userId).get();
    const currentPlan: PlanId = userDoc.data()?.currentPlan || "pro";
    const limit = PLANS[currentPlan].dailyLimit;

    await docRef.set({
      userId,
      date: today,
      aiApplyCount: 1,
      plan: currentPlan,
      limit,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
}
