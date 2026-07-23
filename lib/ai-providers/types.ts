import type { ParsedResumeData } from "@/types/resume";

export type AIProviderName = "gemini" | "azure-openai" | "bedrock-claude";

export interface AIProvider {
  name: AIProviderName;
  displayName: string;
  parseResume(pdfBuffer: Buffer): Promise<ParsedResumeData>;
}
