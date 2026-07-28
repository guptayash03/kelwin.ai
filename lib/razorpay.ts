import crypto from "crypto";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
const RAZORPAY_BASE_URL = "https://api.razorpay.com/v1";

function getAuthHeader(): string {
  return `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64")}`;
}

async function razorpayFetch(
  path: string,
  options: RequestInit = {}
): Promise<any> {
  const res = await fetch(`${RAZORPAY_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      `Razorpay API error (${res.status}): ${data.error?.description || JSON.stringify(data)}`
    );
  }
  return data;
}

export async function createSubscription(
  planId: string,
  customerEmail: string,
  userId: string
): Promise<{ id: string; short_url: string }> {
  return razorpayFetch("/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      plan_id: planId,
      total_count: 120,
      quantity: 1,
      notes: {
        userId,
        email: customerEmail,
      },
      notify_info: {
        notify_email: customerEmail,
      },
    }),
  });
}

export async function cancelSubscription(
  subscriptionId: string,
  cancelAtCycleEnd: boolean = true
): Promise<any> {
  return razorpayFetch(`/subscriptions/${subscriptionId}/cancel`, {
    method: "POST",
    body: JSON.stringify({
      cancel_at_cycle_end: cancelAtCycleEnd ? 1 : 0,
    }),
  });
}

export async function fetchSubscription(subscriptionId: string): Promise<any> {
  return razorpayFetch(`/subscriptions/${subscriptionId}`);
}

export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );
}
