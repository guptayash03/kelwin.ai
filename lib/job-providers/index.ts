import type { JobPlatform } from "@/types/job";
import type { JobProvider } from "./types";
import { GreenhouseProvider } from "./greenhouse";
import { LeverProvider } from "./lever";
import { AshbyProvider } from "./ashby";
import { FirecrawlProvider } from "./firecrawl";
import { WorkdayProvider } from "./workday";

const providers: Record<JobPlatform, () => JobProvider> = {
  greenhouse: () => new GreenhouseProvider(),
  lever: () => new LeverProvider(),
  ashby: () => new AshbyProvider(),
  "career-portals": () => new FirecrawlProvider(),
  workday: () => new WorkdayProvider(),
};

export function getJobProvider(platform: JobPlatform): JobProvider {
  const factory = providers[platform];
  if (!factory) {
    throw new Error(`Unknown job platform: ${platform}`);
  }
  return factory();
}

export { COMPANY_REGISTRY } from "./companies";
export type { CompanyConfig, JobProvider } from "./types";
