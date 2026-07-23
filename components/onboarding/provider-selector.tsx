"use client";

import { motion } from "framer-motion";
import { Sparkles, Cloud, Cpu } from "lucide-react";
import type { AIProviderName } from "@/lib/ai-providers/types";

interface ProviderSelectorProps {
  selected: AIProviderName;
  onSelect: (provider: AIProviderName) => void;
  disabled?: boolean;
}

const providers: Array<{
  id: AIProviderName;
  name: string;
  icon: typeof Sparkles;
  description: string;
}> = [
  {
    id: "gemini",
    name: "Gemini",
    icon: Sparkles,
    description: "Google's multimodal AI",
  },
  {
    id: "azure-openai",
    name: "Azure OpenAI",
    icon: Cloud,
    description: "GPT-powered parsing",
  },
  {
    id: "bedrock-claude",
    name: "Bedrock Claude",
    icon: Cpu,
    description: "Anthropic via AWS",
  },
];

export function ProviderSelector({
  selected,
  onSelect,
  disabled,
}: ProviderSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        AI Provider
      </label>
      <div className="grid grid-cols-3 gap-3">
        {providers.map((provider) => {
          const isSelected = selected === provider.id;
          const Icon = provider.icon;
          return (
            <motion.button
              key={provider.id}
              type="button"
              onClick={() => !disabled && onSelect(provider.id)}
              whileTap={disabled ? undefined : { scale: 0.97 }}
              className={`relative flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/30 hover:bg-accent/30"
              } ${disabled ? "pointer-events-none opacity-50" : ""}`}
            >
              <Icon
                className={`h-5 w-5 ${
                  isSelected ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  isSelected ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {provider.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
