import { FieldValue } from "firebase-admin/firestore";
import type { FantasticJobResponse } from "./types";

export interface CentralJobWrite {
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
  firstSeenAt: FieldValue;
  lastSyncedAt: FieldValue;
  expiredAt: null;
  _countries: string[];
  _source: string;
  _experienceLevel: string | null;
  _workArrangement: string | null;
  _employmentTypes: string[];
}

export function mapFantasticJobToCentralJob(raw: FantasticJobResponse): CentralJobWrite {
  const skills = mergeSkills(raw);
  const employmentType = (raw.ai_employment_type || []).map((t) => t.toUpperCase());

  return {
    fantasticId: raw.id,
    title: raw.title,
    organization: raw.organization,
    organizationLogo: raw.org_logo_permalink || raw.organization_logo || null,
    orgLinkedinSlug: raw.org_linkedin_slug || null,
    orgDomain: raw.domain_derived || null,
    orgWebsite: raw.org_linkedin_website || null,
    orgIndustry: raw.org_linkedin_industry || null,
    orgHeadcount: raw.org_linkedin_headcount || null,
    orgDescription: raw.org_linkedin_description || null,
    url: raw.url,
    descriptionHtml: raw.description_html || null,
    locationsRaw: raw.locations_derived || [],
    cities: raw.cities_derived || [],
    countries: raw.countries_derived || [],
    regions: raw.regions_derived || [],
    experienceLevel: raw.ai_experience_level || null,
    workArrangement: raw.ai_work_arrangement || null,
    employmentType,
    skills,
    keywords: raw.ai_keywords || [],
    salaryMin: raw.ai_salary_min_value || null,
    salaryMax: raw.ai_salary_max_value || null,
    salaryCurrency: raw.ai_salary_currency || null,
    salaryUnit: raw.ai_salary_unit_text || null,
    benefits: raw.ai_benefits || [],
    education: raw.ai_education || [],
    visaSponsorship: raw.ai_visa_sponsorship ?? null,
    coreResponsibilities: raw.ai_core_responsibilities || null,
    requirementsSummary: raw.ai_requirements_summary || null,
    source: raw.source,
    sourceDomain: raw.source_domain || null,
    jobSource: raw.source_type === "ats" ? "ats" : "job-board",
    datePosted: raw.date_posted || null,
    status: "active",
    firstSeenAt: FieldValue.serverTimestamp(),
    lastSyncedAt: FieldValue.serverTimestamp(),
    expiredAt: null,
    // Index fields for Firestore queries
    _countries: (raw.countries_derived || []).map((c) => c.toLowerCase()),
    _source: raw.source.toLowerCase(),
    _experienceLevel: raw.ai_experience_level?.toLowerCase() || null,
    _workArrangement: raw.ai_work_arrangement?.toLowerCase() || null,
    _employmentTypes: employmentType.map((t) => t.toLowerCase()),
  };
}

export function buildUpdateFields(raw: FantasticJobResponse): Record<string, unknown> {
  const skills = mergeSkills(raw);
  const employmentType = (raw.ai_employment_type || []).map((t) => t.toUpperCase());

  return {
    title: raw.title,
    organization: raw.organization,
    organizationLogo: raw.org_logo_permalink || raw.organization_logo || null,
    orgLinkedinSlug: raw.org_linkedin_slug || null,
    orgDomain: raw.domain_derived || null,
    orgWebsite: raw.org_linkedin_website || null,
    orgIndustry: raw.org_linkedin_industry || null,
    orgHeadcount: raw.org_linkedin_headcount || null,
    orgDescription: raw.org_linkedin_description || null,
    url: raw.url,
    descriptionHtml: raw.description_html || null,
    locationsRaw: raw.locations_derived || [],
    cities: raw.cities_derived || [],
    countries: raw.countries_derived || [],
    regions: raw.regions_derived || [],
    experienceLevel: raw.ai_experience_level || null,
    workArrangement: raw.ai_work_arrangement || null,
    employmentType,
    skills,
    keywords: raw.ai_keywords || [],
    salaryMin: raw.ai_salary_min_value || null,
    salaryMax: raw.ai_salary_max_value || null,
    salaryCurrency: raw.ai_salary_currency || null,
    salaryUnit: raw.ai_salary_unit_text || null,
    benefits: raw.ai_benefits || [],
    education: raw.ai_education || [],
    visaSponsorship: raw.ai_visa_sponsorship ?? null,
    coreResponsibilities: raw.ai_core_responsibilities || null,
    requirementsSummary: raw.ai_requirements_summary || null,
    source: raw.source,
    sourceDomain: raw.source_domain || null,
    jobSource: raw.source_type === "ats" ? "ats" : "job-board",
    datePosted: raw.date_posted || null,
    status: "active",
    lastSyncedAt: FieldValue.serverTimestamp(),
    _countries: (raw.countries_derived || []).map((c) => c.toLowerCase()),
    _source: raw.source.toLowerCase(),
    _experienceLevel: raw.ai_experience_level?.toLowerCase() || null,
    _workArrangement: raw.ai_work_arrangement?.toLowerCase() || null,
    _employmentTypes: employmentType.map((t) => t.toLowerCase()),
  };
}

function mergeSkills(raw: FantasticJobResponse): string[] {
  const aiSkills = raw.ai_key_skills || [];
  const lightcastSkills = (raw.classification_lightcast_skills || []).map((s) => s.name);
  const combined = new Set([...aiSkills, ...lightcastSkills]);
  return Array.from(combined);
}
