import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeJwt } from "jose";
import { adminDb } from "@/lib/firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ApplicationDocument } from "@/types/application";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = request.cookies.get("__session")?.value;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let uid: string;
  try {
    const payload = decodeJwt(session);
    uid = payload.sub as string;
    if (!uid) throw new Error("No uid in token");
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  let body: { applicationId?: string; fieldLabel?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { applicationId, fieldLabel } = body;
  if (!applicationId || !fieldLabel) {
    return NextResponse.json(
      { error: "Missing applicationId or fieldLabel" },
      { status: 400 }
    );
  }

  try {
    const appDoc = await adminDb.collection("applications").doc(applicationId).get();
    if (!appDoc.exists) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const appData = appDoc.data() as ApplicationDocument;
    if (appData.userId !== uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const userDoc = await adminDb.collection("users").doc(uid).get();
    const userData = userDoc.data();
    const resumeId = userData?.resumeId;

    let parsedData = {};
    if (resumeId) {
      const resumeDoc = await adminDb.collection("resumes").doc(resumeId).get();
      parsedData = resumeDoc.data()?.parsedData || {};
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI provider not configured" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-2.5-flash" });

    const prompt = `You are helping a job applicant fill out a job application form.

Job Title: ${appData.jobTitle}
Company: ${appData.company}

The applicant's profile:
${JSON.stringify(parsedData, null, 2)}

The application form has a field that the applicant needs to fill:
Field: "${fieldLabel}"

Based on the applicant's profile and the job they're applying for, provide a concise, appropriate answer for this field. If the field asks about current employer/job title and the applicant is a student, say "Student" or "N/A" as appropriate. If it's a country/location question, use the location from their profile.

Return ONLY the answer text, nothing else. Keep it short and direct.`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text().trim();

    return NextResponse.json({ answer });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Failed to generate answer:", message);
    return NextResponse.json(
      { error: `Failed to generate answer: ${message}` },
      { status: 500 }
    );
  }
}
