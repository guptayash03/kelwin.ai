import { GeminiProvider } from "./gemini";
import { AzureOpenAIProvider } from "./azure-openai";
import { BedrockClaudeProvider } from "./bedrock-claude";
import type { AIProvider, AIProviderName } from "./types";

const providers: Record<AIProviderName, () => AIProvider> = {
  gemini: () => new GeminiProvider(),
  "azure-openai": () => new AzureOpenAIProvider(),
  "bedrock-claude": () => new BedrockClaudeProvider(),
};

export function getProvider(name: AIProviderName): AIProvider {
  const factory = providers[name];
  if (!factory) throw new Error(`Unknown AI provider: ${name}`);
  return factory();
}

export type { AIProvider, AIProviderName };
