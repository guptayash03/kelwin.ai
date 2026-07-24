"use client";

import type { JobPlatform } from "@/types/job";

interface PlatformSelectorProps {
  selected: JobPlatform[];
  onToggle: (platform: JobPlatform) => void;
}

const PLATFORMS: {
  id: JobPlatform;
  name: string;
  logo: string;
  description: string;
}[] = [
  {
    id: "career-portals",
    name: "Career Portals",
    logo: "https://unavatar.io/google.com?fallback=false",
    description: "Official company career sites",
  },
  {
    id: "greenhouse",
    name: "Greenhouse",
    logo: "https://unavatar.io/greenhouse.io?fallback=false",
    description: "Greenhouse job boards",
  },
  {
    id: "lever",
    name: "Lever",
    logo: "https://unavatar.io/lever.co?fallback=false",
    description: "Lever job postings",
  },
  {
    id: "ashby",
    name: "Ashby",
    logo: "https://unavatar.io/ashbyhq.com?fallback=false",
    description: "Ashby job boards",
  },
  {
    id: "workday",
    name: "Workday",
    logo: "https://unavatar.io/workday.com?fallback=false",
    description: "Workday job portals",
  },
];

export function PlatformSelector({ selected, onToggle }: PlatformSelectorProps) {
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {PLATFORMS.map((platform) => {
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
                className={`flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden ${
                  isSelected ? "bg-white" : "bg-white"
                }`}
              >
                <img
                  src={platform.logo}
                  alt={platform.name}
                  className="h-7 w-7 object-contain"
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    el.style.display = "none";
                    el.parentElement!.innerHTML = `<span class="text-sm font-bold text-muted-foreground">${platform.name.charAt(0)}</span>`;
                  }}
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
    </div>
  );
}
