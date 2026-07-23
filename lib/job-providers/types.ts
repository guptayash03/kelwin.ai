import type { JobPlatform, RawJobListing } from "@/types/job";

export interface CompanyConfig {
  name: string;
  domain: string;
  platforms: {
    greenhouse?: string;
    lever?: string;
    ashby?: string;
    workday?: string;
    careerPortal?: string;
  };
}

export interface JobProvider {
  platform: JobPlatform;
  displayName: string;
  searchJobs(companies: CompanyConfig[]): Promise<RawJobListing[]>;
}
