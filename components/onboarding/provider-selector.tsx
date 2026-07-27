"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import type { AIProviderName } from "@/lib/ai-providers/types";

interface ProviderSelectorProps {
  selected: AIProviderName;
  onSelect: (provider: AIProviderName) => void;
  disabled?: boolean;
}

const providers: Array<{
  id: AIProviderName;
  name: string;
  desc: string;
}> = [
  { id: "gemini", name: "Gemini 3 Pro", desc: "Google" },
  { id: "azure-openai", name: "GPT-5.6", desc: "OpenAI" },
  { id: "bedrock-claude", name: "Claude Opus 4.8", desc: "Anthropic" },
];

function ProviderLogo({ id }: { id: AIProviderName }) {
  if (id === "gemini") {
    return (
      <div className="flex h-8 w-8 items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
          <path
            d="M12 0C12 6.63 6.63 12 0 12C6.63 12 12 17.37 12 24C12 17.37 17.37 12 24 12C17.37 12 12 6.63 12 0Z"
            fill="url(#gemini_g_onb)"
          />
          <defs>
            <radialGradient
              id="gemini_g_onb"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(12 12) scale(12)"
            >
              <stop stopColor="#1BA1E3" />
              <stop offset="0.3" stopColor="#5489D6" />
              <stop offset="0.55" stopColor="#9B72CB" />
              <stop offset="0.75" stopColor="#D96570" />
              <stop offset="1" stopColor="#F49C46" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    );
  }
  if (id === "azure-openai") {
    return (
      <div className="flex h-8 w-8 items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
          <path
            d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.998 5.998 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"
            fill="#000000"
          />
        </svg>
      </div>
    );
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center">
      <svg viewBox="0 0 512 509.64" className="h-7 w-7">
        <path
          fill="#D77655"
          d="M115.612 0h280.775C459.974 0 512 52.026 512 115.612v278.415c0 63.587-52.026 115.612-115.613 115.612H115.612C52.026 509.639 0 457.614 0 394.027V115.612C0 52.026 52.026 0 115.612 0z"
        />
        <path
          fill="#FCF2EE"
          fillRule="nonzero"
          d="M142.27 316.619l73.655-41.326 1.238-3.589-1.238-1.996-3.589-.001-12.31-.759-42.084-1.138-36.498-1.516-35.361-1.896-8.897-1.895-8.34-10.995.859-5.484 7.482-5.03 10.717.935 23.683 1.617 35.537 2.452 25.782 1.517 38.193 3.968h6.064l.86-2.451-2.073-1.517-1.618-1.517-36.776-24.922-39.81-26.338-20.852-15.166-11.273-7.683-5.687-7.204-2.451-15.721 10.237-11.273 13.75.935 3.513.936 13.928 10.716 29.749 23.027 38.848 28.612 5.687 4.727 2.275-1.617.278-1.138-2.553-4.271-21.13-38.193-22.546-38.848-10.035-16.101-2.654-9.655c-.935-3.968-1.617-7.304-1.617-11.374l11.652-15.823 6.445-2.073 15.545 2.073 6.547 5.687 9.655 22.092 15.646 34.78 24.265 47.291 7.103 14.028 3.791 12.992 1.416 3.968 2.449-.001v-2.275l1.997-26.641 3.69-32.707 3.589-42.084 1.239-11.854 5.863-14.206 11.652-7.683 9.099 4.348 7.482 10.716-1.036 6.926-4.449 28.915-8.72 45.294-5.687 30.331h3.313l3.792-3.791 15.342-20.372 25.782-32.227 11.374-12.789 13.27-14.129 8.517-6.724 16.1-.001 11.854 17.617-5.307 18.199-16.581 21.029-13.75 17.819-19.716 26.54-12.309 21.231 1.138 1.694 2.932-.278 44.536-9.479 24.062-4.347 28.714-4.928 12.992 6.066 1.416 6.167-5.106 12.613-30.71 7.583-36.018 7.204-53.636 12.689-.657.48.758.935 24.164 2.275 10.337.556h25.301l47.114 3.514 12.309 8.139 7.381 9.959-1.238 7.583-18.957 9.655-25.579-6.066-59.702-14.205-20.474-5.106-2.83-.001v1.694l17.061 16.682 31.266 28.233 39.152 36.397 1.997 8.999-5.03 7.102-5.307-.758-34.401-25.883-13.27-11.651-30.053-25.302-1.996-.001v2.654l6.926 10.136 36.574 54.975 1.895 16.859-2.653 5.485-9.479 3.311-10.414-1.895-21.408-30.054-22.092-33.844-17.819-30.331-2.173 1.238-10.515 113.261-4.929 5.788-11.374 4.348-9.478-7.204-5.03-11.652 5.03-23.027 6.066-30.052 4.928-23.886 4.449-29.674 2.654-9.858-.177-.657-2.173.278-22.37 30.71-34.021 45.977-26.919 28.815-6.445 2.553-11.173-5.789 1.037-10.337 6.243-9.2 37.257-47.392 22.47-29.371 14.508-16.961-.101-2.451h-.859l-98.954 64.251-17.618 2.275-7.583-7.103.936-11.652 3.589-3.791 29.749-20.474-.101.102.024.101z"
        />
      </svg>
    </div>
  );
}

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
      <div className="grid grid-cols-3 gap-2">
        {providers.map((provider) => {
          const isSelected = selected === provider.id;
          return (
            <motion.button
              key={provider.id}
              type="button"
              onClick={() => !disabled && onSelect(provider.id)}
              whileTap={disabled ? undefined : { scale: 0.97 }}
              className={`relative flex flex-col items-center gap-1.5 rounded-lg border p-2.5 transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/40 hover:bg-muted/40"
              } ${disabled ? "pointer-events-none opacity-50" : ""}`}
            >
              {isSelected && (
                <div className="absolute top-1.5 right-1.5">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                </div>
              )}
              <ProviderLogo id={provider.id} />
              <div className="text-center">
                <p className="text-[11px] font-medium text-foreground">
                  {provider.name}
                </p>
                <p className="text-[9px] text-muted-foreground">
                  {provider.desc}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
