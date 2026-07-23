import { AzureOpenAI } from "openai";
import type { AIProvider } from "./types";
import type { ParsedResumeData } from "@/types/resume";
import { RESUME_PARSE_PROMPT } from "./prompt";

export class AzureOpenAIProvider implements AIProvider {
  name = "azure-openai" as const;
  displayName = "Azure OpenAI";

  async parseResume(pdfBuffer: Buffer): Promise<ParsedResumeData> {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

    if (!endpoint || !apiKey || !deployment) {
      throw new Error("Azure OpenAI environment variables not configured");
    }

    const client = new AzureOpenAI({
      endpoint,
      apiKey,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-10-21",
    });

    const base64Pdf = pdfBuffer.toString("base64");
    const response = await client.chat.completions.create({
      model: process.env.AZURE_OPENAI_MODEL || deployment,
      messages: [
        { role: "system", content: RESUME_PARSE_PROMPT },
        {
          role: "user",
          content: [
            {
              type: "file",
              file: {
                filename: "resume.pdf",
                file_data: `data:application/pdf;base64,${base64Pdf}`,
              },
            } as never,
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const text = response.choices[0].message.content;
    if (!text) throw new Error("No response from Azure OpenAI");
    return JSON.parse(text) as ParsedResumeData;
  }
}
