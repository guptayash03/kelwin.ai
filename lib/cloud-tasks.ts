import type { TaskType } from "@/types/application";
import { SignJWT, importPKCS8 } from "jose";
import { readFileSync } from "fs";
import { resolve } from "path";

const PROJECT_ID = process.env.GCP_PROJECT_ID || "";
const LOCATION = process.env.GCP_LOCATION || "asia-south1";
const QUEUE_NAME = process.env.GCP_QUEUE_NAME || "application-tasks";
const WORKER_URL = process.env.CLOUD_RUN_WORKER_URL || "";
const SERVICE_ACCOUNT_EMAIL = process.env.GCP_SERVICE_ACCOUNT_EMAIL || "";

let cachedKey: { client_email: string; private_key: string } | null = null;

function getServiceAccountKey() {
  if (cachedKey) return cachedKey;
  const keyPath = resolve(
    process.env.GOOGLE_APPLICATION_CREDENTIALS || "./kelwin-app-sa-key.json"
  );
  cachedKey = JSON.parse(readFileSync(keyPath, "utf-8"));
  return cachedKey!;
}

async function getAccessToken(): Promise<string> {
  const key = getServiceAccountKey();
  const now = Math.floor(Date.now() / 1000);
  const privateKey = await importPKCS8(key.private_key, "RS256");

  const jwt = await new SignJWT({
    iss: key.client_email,
    sub: key.client_email,
    aud: "https://oauth2.googleapis.com/token",
    scope: "https://www.googleapis.com/auth/cloud-tasks",
    iat: now,
    exp: now + 3600,
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .sign(privateKey);

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

export async function createApplicationTask(
  applicationId: string,
  userId: string,
  taskType: TaskType
): Promise<string> {
  const accessToken = await getAccessToken();
  const parent = `projects/${PROJECT_ID}/locations/${LOCATION}/queues/${QUEUE_NAME}`;
  const payload = JSON.stringify({ applicationId, userId });

  const res = await fetch(
    `https://cloudtasks.googleapis.com/v2/${parent}/tasks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task: {
          httpRequest: {
            httpMethod: "POST",
            url: `${WORKER_URL}/tasks/${taskType}`,
            headers: { "Content-Type": "application/json" },
            body: Buffer.from(payload).toString("base64"),
            oidcToken: {
              serviceAccountEmail: SERVICE_ACCOUNT_EMAIL,
              audience: WORKER_URL,
            },
          },
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cloud Tasks API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.name || "";
}
