"use client";

import type { JobPlatform } from "@/types/job";
import { Building2, Briefcase, Layers, Sparkles, Building } from "lucide-react";

interface PlatformSelectorProps {
  selected: JobPlatform[];
  onToggle: (platform: JobPlatform) => void;
}

const PLATFORMS: {
  id: JobPlatform;
  name: string;
  icon: typeof Building2;
  description: string;
}[] = [
  {
    id: "career-portals",
    name: "Career Portals",
    icon: Building2,
    description: "Official company career sites",
  },
  {
    id: "greenhouse",
    name: "Greenhouse",
    icon: Briefcase,
    description: "Greenhouse job boards",
  },
  {
    id: "lever",
    name: "Lever",
    icon: Layers,
    description: "Lever job postings",
  },
  {
    id: "ashby",
    name: "Ashby",
    icon: Sparkles,
    description: "Ashby job boards",
  },
  {
    id: "workday",
    name: "Workday",
    icon: Building,
    description: "Workday job portals",
  },
];

export function PlatformSelector({ selected, onToggle }: PlatformSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {PLATFORMS.map((platform) => {
        const Icon = platform.icon;
        const isSelected = selected.includes(platform.id);

        return (
          <button
            key={platform.id}
            onClick={() => onToggle(platform.id)}
            className={`relative flex flex-col items-center gap-2 rounded-xl border p-4 transition-all cursor-pointer ${
              isSelected
                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                : "border-border bg-card hover:border-border/80 hover:bg-muted/50"
            }`}
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                isSelected ? "bg-primary/10" : "bg-muted"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  isSelected ? "text-primary" : "text-muted-foreground"
                }`}
              />
            </div>
            <div className="text-center">
              <p
                className={`text-xs font-medium ${
                  isSelected ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {platform.name}
              </p>
            </div>
            {isSelected && (
              <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}
