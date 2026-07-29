export const PLANS = {
  pro: {
    id: "pro" as const,
    name: "Pro",
    price: 0,
    currency: "INR",
    interval: "monthly",
    dailyLimit: 25,
    description: "25 AI Job Applies per day",
    features: [
      "25 AI job applications per day",
      "Smart form detection",
      "Resume auto-fill",
      "Application tracking",
    ],
  },
  unlimited: {
    id: "unlimited" as const,
    name: "Unlimited",
    price: 199,
    currency: "INR",
    interval: "monthly",
    dailyLimit: null as number | null,
    description: "Unlimited AI Job Applies",
    features: [
      "Unlimited AI job applications",
      "Smart form detection",
      "Resume auto-fill",
      "Application tracking",
      "Priority processing",
      "Early access to new features",
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;

export function getRazorpayPlanId(planId: PlanId): string {
  if (planId === "unlimited") {
    return process.env.RAZORPAY_PLAN_ID_UNLIMITED || "";
  }
  return "";
}
