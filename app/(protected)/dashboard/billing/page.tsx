"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useSubscription } from "@/hooks/use-subscription";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PLANS } from "@/config/plans";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CreditCard,
  Sparkles,
  Check,
  Infinity,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

interface BillingHistoryItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  createdAt: any;
}

export default function BillingPage() {
  const { user } = useAuth();
  const subscription = useSubscription();
  const [subscribing, setSubscribing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "billingHistory"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(10)
    );
    const unsub = onSnapshot(q, (snap) => {
      setBillingHistory(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as BillingHistoryItem))
      );
      setHistoryLoading(false);
    }, () => setHistoryLoading(false));
    return unsub;
  }, [user]);

  async function handleSubscribe() {
    setSubscribing(true);
    try {
      const res = await fetch("/api/billing/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: "unlimited" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const { subscriptionId, razorpayKeyId } = data;

      const options = {
        key: razorpayKeyId,
        subscription_id: subscriptionId,
        name: "Kelwin AI",
        description: "Unlimited Plan - ₹199/month",
        handler: () => {},
        theme: { color: "#7c3aed" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Subscribe error:", err);
    } finally {
      setSubscribing(false);
    }
  }

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel your subscription? You'll retain access until the end of your current billing period.")) return;
    setCancelling(true);
    try {
      const res = await fetch("/api/billing/cancel", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
    } catch (err) {
      console.error("Cancel error:", err);
    } finally {
      setCancelling(false);
    }
  }

  if (subscription.loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Billing & Credits</h2>
          <p className="text-sm text-muted-foreground">Manage your subscription and usage.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const isUnlimited = subscription.currentPlan === "unlimited";
  const isActive = subscription.subscriptionStatus === "active";
  const isCancelling = subscription.subscriptionStatus === "cancelling";
  const percentage = subscription.dailyLimit
    ? Math.round((subscription.dailyUsage / subscription.dailyLimit) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Billing & Credits</h2>
        <p className="text-sm text-muted-foreground">Manage your subscription and usage.</p>
      </div>

      {/* Current Plan & Usage */}
      <div className="grid gap-4 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="size-4" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {isUnlimited ? "Unlimited" : "Pro"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isUnlimited ? "₹199/month" : "Free"}
                  </p>
                </div>
                <Badge variant={isActive || isCancelling ? "default" : "secondary"}>
                  {isCancelling ? "Cancelling" : isActive ? "Active" : "Free"}
                </Badge>
              </div>
              {subscription.currentPeriodEnd && (
                <p className="mt-3 text-xs text-muted-foreground">
                  {isCancelling ? "Access until" : "Renews on"}{" "}
                  {subscription.currentPeriodEnd.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
              {isActive && !isCancelling && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling ? "Cancelling..." : "Cancel Subscription"}
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="size-4" />
                Today&apos;s Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isUnlimited ? (
                <div className="flex items-center gap-2">
                  <Infinity className="size-6 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{subscription.dailyUsage}</p>
                    <p className="text-sm text-muted-foreground">Applications today · No limit</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-baseline justify-between">
                    <p className="text-2xl font-bold">
                      {subscription.dailyUsage}
                      <span className="text-base font-normal text-muted-foreground">
                        /{subscription.dailyLimit}
                      </span>
                    </p>
                    <span className="text-sm text-muted-foreground">
                      {subscription.remainingToday} remaining
                    </span>
                  </div>
                  <Progress value={percentage} className="mt-3" />
                  {percentage >= 80 && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                      <AlertCircle className="size-3" />
                      Running low on daily applies
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Plan Cards */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h3 className="mb-4 text-lg font-medium">Available Plans</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Pro Card */}
          <Card className={!isUnlimited ? "border-primary" : ""}>
            <CardHeader>
              <CardTitle>{PLANS.pro.name}</CardTitle>
              <CardDescription>
                <span className="text-2xl font-bold text-foreground">₹0</span>
                <span className="text-muted-foreground">/month</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {PLANS.pro.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="size-4 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="mt-4 w-full"
                disabled
              >
                {!isUnlimited ? "Current Plan" : "Downgrade"}
              </Button>
            </CardContent>
          </Card>

          {/* Unlimited Card */}
          <Card className={isUnlimited ? "border-primary" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{PLANS.unlimited.name}</CardTitle>
                {!isUnlimited && (
                  <Badge variant="secondary" className="text-xs">Popular</Badge>
                )}
              </div>
              <CardDescription>
                <span className="text-2xl font-bold text-foreground">₹199</span>
                <span className="text-muted-foreground">/month</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {PLANS.unlimited.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="size-4 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              {isUnlimited ? (
                <Button variant="outline" className="mt-4 w-full" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button
                  className="mt-4 w-full"
                  onClick={handleSubscribe}
                  disabled={subscribing}
                >
                  {subscribing ? "Processing..." : "Subscribe"}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Billing History */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h3 className="mb-4 text-lg font-medium">Billing History</h3>
        <Card>
          <CardContent className="pt-6">
            {historyLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : billingHistory.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No payment history yet.
              </p>
            ) : (
              <div className="space-y-3">
                {billingHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        ₹{item.amount} · {item.paymentMethod}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.createdAt?.toDate?.()
                          ? item.createdAt.toDate().toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </p>
                    </div>
                    <Badge
                      variant={item.status === "captured" ? "default" : "destructive"}
                    >
                      {item.status === "captured" ? "Paid" : item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
