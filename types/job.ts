export type JobPlatform =
  | "greenhouse"
  | "lever"
  | "ashby"
  | "workday"
  | "career-portals";

export interface NormalizedJob {
  id: string;
  externalId: string;
  userId: string;
  platform: JobPlatform;
  company: string;
  companyLogo: string;
  title: string;
  location: string;
  country: string;
  salary: string | null;
  employmentType: string | null;
  experienceLevel: string | null;
  description: string | null;
  skills: string[];
  matchScore: number;
  applyUrl: string;
  sourceUrl: string | null;
  saved: boolean;
  postedDate: string | null;
  fetchedAt: unknown;
}

export interface RawJobListing {
  externalId: string;
  title: string;
  company: string;
  companyDomain: string;
  location: string;
  description?: string;
  applyUrl: string;
  sourceUrl?: string;
  postedDate?: string;
  salary?: string;
  employmentType?: string;
  departments?: string[];
}
