export interface FantasticJobResponse {
  id: number;
  date_posted: string | null;
  date_created: string;
  title: string;
  organization: string;
  organization_url: string | null;
  date_valid_through: string | null;
  locations: FantasticLocation[] | null;
  locations_alt: string[] | null;
  location_type: string | null;
  location_requirements: string | null;
  salary: string | null;
  employment_type: string[] | null;
  url: string;
  source_type: "ats" | "jb";
  source: string;
  source_domain: string;
  source_slug: string | null;
  organization_logo: string | null;
  cities_derived: string[] | null;
  counties_derived: string[] | null;
  regions_derived: string[] | null;
  countries_derived: string[] | null;
  locations_derived: string[] | null;
  timezones_derived: string[] | null;
  lats_derived: number[] | null;
  lngs_derived: number[] | null;
  domain_derived: string;
  org_linkedin_slug: string;
  description_html?: string;
  // AI-enriched fields
  ai_salary_currency: string | null;
  ai_salary_value: number | null;
  ai_salary_min_value: number | null;
  ai_salary_max_value: number | null;
  ai_salary_unit_text: string | null;
  ai_benefits: string[] | null;
  ai_experience_level: string | null;
  ai_work_arrangement: string | null;
  ai_work_arrangement_office_days: number | null;
  ai_remote_location: string[] | null;
  ai_remote_location_derived: string[] | null;
  ai_key_skills: string[] | null;
  ai_hiring_manager_name: string | null;
  ai_hiring_manager_email_address: string | null;
  ai_core_responsibilities: string | null;
  ai_requirements_summary: string | null;
  ai_working_hours: number | null;
  ai_employment_type: string[] | null;
  ai_job_language: string | null;
  ai_visa_sponsorship: boolean | null;
  ai_keywords: string[] | null;
  ai_taxonomies_a: string[] | null;
  ai_education: string[] | null;
  // Organization LinkedIn fields
  org_linkedin_headcount: number | null;
  org_linkedin_website: string | null;
  org_linkedin_size: string | null;
  org_linkedin_slogan: string | null;
  org_linkedin_industry: string | null;
  org_linkedin_followers: number | null;
  org_linkedin_headquarters: string | null;
  org_linkedin_type: string | null;
  org_linkedin_founded_date: string | null;
  org_linkedin_specialties: string[] | null;
  org_linkedin_locations: string[] | null;
  org_linkedin_description: string | null;
  org_linkedin_recruitment_agency_derived: boolean | null;
  org_linkedin_name: string | null;
  // Organization Crunchbase fields
  org_crunchbase_categories: string[] | null;
  org_crunchbase_total_investment: number | null;
  // Logo
  org_logo_permalink: string | null;
  // Classification fields
  classification_isco?: { id: string; name: string } | null;
  classification_onet?: { id: string; name: string } | null;
  classification_soc?: { id: string; name: string } | null;
  classification_lightcast_occupation?: { id: string; name: string; confidence: number } | null;
  classification_lightcast_title?: { id: string; name: string; confidence: number } | null;
  classification_lightcast_skills?: Array<{ id: string; name: string; confidence: number }> | null;
}

export interface FantasticLocation {
  "@type": string;
  address: {
    "@type": string;
    addressCountry: string;
    addressLocality: string;
    addressRegion: string | null;
    postalCode: string | null;
  };
}

export interface FantasticJobsParams {
  time_frame?: "1h" | "24h" | "7d" | "6m";
  limit?: number;
  offset?: number;
  cursor?: number;
  title?: string;
  title_advanced?: string;
  description?: string;
  description_advanced?: string;
  location?: string;
  location_advanced?: string;
  organization?: string;
  organization_advanced?: string;
  exclude_organization?: string;
  source?: string;
  exclude_source?: string;
  domain?: string;
  exclude_domain?: string;
  organization_slug?: string;
  exclude_organization_slug?: string;
  organization_industry?: string;
  exclude_organization_industry?: string;
  organization_headcount_gte?: number;
  organization_headcount_lt?: number;
  organization_size?: string;
  organization_funding_gte?: number;
  organization_funding_lt?: number;
  organization_agency?: "only" | "exclude";
  ai_experience_level?: string;
  ai_work_arrangement?: string;
  ai_employment_type?: string;
  ai_language?: string;
  ai_education?: string;
  ai_taxonomies_a?: string;
  ai_taxonomies_a_primary?: string;
  exclude_ai_taxonomies_a?: string;
  ai_visa_sponsorship?: "only" | "exclude";
  has_salary?: "true";
  has_no_location?: "true";
  date_posted_gte?: string;
  date_posted_lt?: string;
  date_created_gte?: string;
  date_created_lt?: string;
  include_basic_organization_details?: "true";
  include_beta?: "true";
  description_format?: "text" | "html";
  exclude_recruiter_fields?: "true";
  exclude_ats_duplicate?: "true";
  seniority?: string;
  direct_apply?: "only" | "exclude";
}
