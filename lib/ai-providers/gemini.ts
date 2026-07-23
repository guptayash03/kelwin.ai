import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIProvider } from "./types";
import type { ParsedResumeData } from "@/types/resume";
import { RESUME_PARSE_PROMPT } from "./prompt";

export class GeminiProvider implements AIProvider {
  name = "gemini" as const;
  displayName = "Google Gemini";

  async parseResume(pdfBuffer: Buffer): Promise<ParsedResumeData> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    const model = genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent([
      { text: RESUME_PARSE_PROMPT },
      {
        inlineData: {
          mimeType: "application/pdf",
          data: pdfBuffer.toString("base64"),
        },
      },
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : text;
    return JSON.parse(jsonStr) as ParsedResumeData;
  }
}
