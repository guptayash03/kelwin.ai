"use client";

import { useEffect, useState } from "react";
import { doc, collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { PLANS, type PlanId } from "@/config/plans";

export interface SubscriptionData {
  currentPlan: PlanId;
  subscriptionStatus: string | null;
  dailyUsage: number;
  dailyLimit: number | null;
  canApply: boolean;
  remainingToday: number | null;
  currentPeriodEnd: Date | null;
  loading: boolean;
}

export function useSubscription(): SubscriptionData {
  const { user } = useAuth();
  const [data, setData] = useState<SubscriptionData>({
    currentPlan: "pro",
    subscriptionStatus: null,
    dailyUsage: 0,
    dailyLimit: 25,
    canApply: true,
    remainingToday: 25,
    currentPeriodEnd: null,
    loading: true,
  });

  useEffect(() => {
    if (!user) {
      setData((prev) => ({ ...prev, loading: false }));
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    const unsubUser = onSnapshot(doc(db, "users", user.uid), (snap) => {
      const userData = snap.data() || {};
      const plan: PlanId = userData.currentPlan || "pro";
      const limit = PLANS[plan].dailyLimit;
      const periodEnd = userData.currentPeriodEnd?.toDate?.() || null;

      setData((prev) => {
        const usage = prev.dailyUsage;
        const canApply = limit === null || usage < limit;
        const remaining = limit === null ? null : Math.max(0, limit - usage);
        return {
          ...prev,
          currentPlan: plan,
          subscriptionStatus: userData.subscriptionStatus || null,
          dailyLimit: limit,
          canApply,
          remainingToday: remaining,
          currentPeriodEnd: periodEnd,
          loading: false,
        };
      });
    });

    const usageQuery = query(
      collection(db, "dailyUsage"),
      where("userId", "==", user.uid),
      where("date", "==", today)
    );

    const unsubUsage = onSnapshot(usageQuery, (snap) => {
      const usage = snap.empty ? 0 : snap.docs[0].data().aiApplyCount || 0;

      setData((prev) => {
        const limit = prev.dailyLimit;
        const canApply = limit === null || usage < limit;
        const remaining = limit === null ? null : Math.max(0, limit - usage);
        return {
          ...prev,
          dailyUsage: usage,
          canApply,
          remainingToday: remaining,
        };
      });
    });

    return () => {
      unsubUser();
      unsubUsage();
    };
  }, [user]);

  return data;
}
