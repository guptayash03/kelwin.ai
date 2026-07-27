import type { Timestamp } from "firebase/firestore";

export interface CentralJob {
  id: string;
  fantasticId: number;
  title: string;
  organization: string;
  organizationLogo: string | null;
  orgLinkedinSlug: string | null;
  orgDomain: string | null;
  orgWebsite: string | null;
  orgIndustry: string | null;
  orgHeadcount: number | null;
  orgDescription: string | null;
  url: string;
  descriptionHtml: string | null;
  locationsRaw: string[];
  cities: string[];
  countries: string[];
  regions: string[];
  experienceLevel: string | null;
  workArrangement: string | null;
  employmentType: string[];
  skills: string[];
  keywords: string[];
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  salaryUnit: string | null;
  benefits: string[];
  education: string[];
  visaSponsorship: boolean | null;
  coreResponsibilities: string | null;
  requirementsSummary: string | null;
  source: string;
  sourceDomain: string | null;
  jobSource: "ats" | "job-board";
  datePosted: string | null;
  status: "active" | "expired";
  firstSeenAt: Timestamp;
  lastSyncedAt: Timestamp;
  expiredAt: Timestamp | null;
  _countries: string[];
  _source: string;
  _experienceLevel: string | null;
  _workArrangement: string | null;
  _employmentTypes: string[];
}

export interface JobFilters {
  experienceLevel?: string | null;
  workArrangement?: string | null;
  employmentType?: string | null;
  source?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  company?: string | null;
  keyword?: string | null;
}

export const EXPERIENCE_LEVELS = [
  { value: "0-2", label: "Entry Level (0-2 yrs)" },
  { value: "2-5", label: "Mid Level (2-5 yrs)" },
  { value: "5-10", label: "Senior (5-10 yrs)" },
  { value: "10+", label: "Staff+ (10+ yrs)" },
] as const;

export const WORK_ARRANGEMENTS = [
  { value: "on-site", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
  { value: "remote ok", label: "Remote OK" },
  { value: "remote solely", label: "Remote Only" },
] as const;

export const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "intern", label: "Internship" },
  { value: "contractor", label: "Contract" },
] as const;

export const JOB_SOURCES = [
  { value: "greenhouse", label: "Greenhouse" },
  { value: "lever.co", label: "Lever" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "workday", label: "Workday" },
  { value: "ashby", label: "Ashby" },
  { value: "wellfound", label: "Wellfound" },
  { value: "ycombinator", label: "Y Combinator" },
] as const;

export const SALARY_RANGES = [
  { value: "any", label: "Any Salary", min: null, max: null },
  { value: "has_salary", label: "Has Salary Info", min: 0, max: null },
  { value: "0-10", label: "≤ 10 LPA", min: null, max: 1000000 },
  { value: "10-20", label: "10–20 LPA", min: 1000000, max: 2000000 },
  { value: "20-30", label: "20–30 LPA", min: 2000000, max: 3000000 },
  { value: "30+", label: "≥ 30 LPA", min: 3000000, max: null },
] as const;
