import { adminDb } from "@/lib/firebase-admin";

export type NotificationType =
  | "credentials_needed"
  | "otp_needed"
  | "review_ready";

interface NotificationData {
  applicationId: string;
  jobTitle: string;
  company: string;
  portal?: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://kelwin.ai";

function buildEmailHtml(
  type: NotificationType,
  data: NotificationData
): string {
  const applicationUrl = `${APP_URL}/dashboard/applications/${data.applicationId}`;

  const templates: Record<
    NotificationType,
    { heading: string; body: string; cta: string }
  > = {
    credentials_needed: {
      heading: `Portal Connection Required`,
      body: `Your application for <strong>${data.jobTitle}</strong> at <strong>${data.company}</strong> requires ${data.portal || "portal"} credentials to continue. Connect your account to resume the application.`,
      cta: "Connect Portal",
    },
    otp_needed: {
      heading: `Verification Code Needed`,
      body: `Your application for <strong>${data.jobTitle}</strong> at <strong>${data.company}</strong> requires a verification code. Please enter the OTP to continue.`,
      cta: "Enter Code",
    },
    review_ready: {
      heading: `Review Your Application`,
      body: `Your application for <strong>${data.jobTitle}</strong> at <strong>${data.company}</strong> has been filled out and is ready for your review before final submission.`,
      cta: "Review & Submit",
    },
  };

  const template = templates[type];

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 16px;">
      <h2 style="color: #111; font-size: 20px; margin-bottom: 16px;">${template.heading}</h2>
      <p style="color: #555; font-size: 15px; line-height: 1.5; margin-bottom: 24px;">${template.body}</p>
      <a href="${applicationUrl}" style="display: inline-block; background: #111; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">${template.cta}</a>
      <p style="color: #999; font-size: 12px; margin-top: 32px;">— Kelwin AI</p>
    </div>
  `;
}

export async function sendNotification(
  userId: string,
  type: NotificationType,
  data: NotificationData
): Promise<void> {
  try {
    const userDoc = await adminDb.collection("users").doc(userId).get();
    const userEmail = userDoc.data()?.email;
    if (!userEmail) return;

    const subjects: Record<NotificationType, string> = {
      credentials_needed: `Action needed: Connect ${data.portal || "portal"} for your ${data.company} application`,
      otp_needed: `Verification code needed — ${data.jobTitle} at ${data.company}`,
      review_ready: `Review your application — ${data.jobTitle} at ${data.company}`,
    };

    await adminDb.collection("mail").add({
      to: userEmail,
      message: {
        subject: subjects[type],
        html: buildEmailHtml(type, data),
      },
    });
  } catch {
    // Best-effort notification — don't crash the calling flow
  }
}
