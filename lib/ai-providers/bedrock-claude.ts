import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import type { AIProvider } from "./types";
import type { ParsedResumeData } from "@/types/resume";
import { RESUME_PARSE_PROMPT } from "./prompt";

export class BedrockClaudeProvider implements AIProvider {
  name = "bedrock-claude" as const;
  displayName = "AWS Bedrock (Claude)";

  async parseResume(pdfBuffer: Buffer): Promise<ParsedResumeData> {
    const region = process.env.AWS_REGION || "us-east-1";
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!accessKeyId || !secretAccessKey) {
      throw new Error("AWS credentials not configured");
    }

    const client = new BedrockRuntimeClient({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });

    const base64Pdf = pdfBuffer.toString("base64");
    const command = new InvokeModelCommand({
      modelId: process.env.BEDROCK_MODEL || "anthropic.claude-sonnet-4-20250514",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 8192,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: base64Pdf,
                },
              },
              { type: "text", text: RESUME_PARSE_PROMPT },
            ],
          },
        ],
      }),
    });

    const response = await client.send(command);
    const body = JSON.parse(new TextDecoder().decode(response.body));
    const text = body.content[0].text;
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : text;
    return JSON.parse(jsonStr) as ParsedResumeData;
  }
}
