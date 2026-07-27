import type { FantasticJobResponse, FantasticJobsParams } from "./types";

const BASE_URL = "https://data.fantastic.jobs/v1";
const MAX_RETRIES = 3;
const RETRY_BASE_MS = 1000;

function getApiKey(): string {
  const key = process.env.FANTASTIC_JOBS_API_KEY;
  if (!key) throw new Error("FANTASTIC_JOBS_API_KEY is not set");
  return key;
}

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${getApiKey()}` },
    });

    if (response.ok) return response;

    if (response.status === 429 || response.status >= 500) {
      if (attempt < retries) {
        const delay = RETRY_BASE_MS * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
    }

    throw new Error(
      `Fantastic.jobs API error: ${response.status} ${response.statusText} for ${url}`
    );
  }

  throw new Error("Unreachable");
}

function buildUrl(endpoint: string, params: Record<string, string | number | undefined>): string {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

// --- Target companies (domains for ATS, org names for JB) ---

const TARGET_DOMAINS = [
  "google.com",
  "microsoft.com",
  "amazon.com",
  "nvidia.com",
  "adobe.com",
  "atlassian.com",
  "databricks.com",
  "snowflake.com",
  "stripe.com",
  "cloudflare.com",
  "palantir.com",
  "oracle.com",
  "cisco.com",
  "rubrik.com",
  "confluent.io",
  "mongodb.com",
  "razorpay.com",
  "cred.club",
  "phonepe.com",
  "groww.in",
  "meesho.com",
  "flipkart.com",
  "uber.com",
  "airbnb.com",
  "salesforce.com",
  "servicenow.com",
  "qualcomm.com",
  "goldmansachs.com",
  "jpmorgan.com",
  "americanexpress.com",
  "autodesk.com",
  "morganstanley.com",
  "barclays.com",
  "db.com",
  "visa.com",
  "mastercard.com",
  "intel.com",
  "samsung.com",
  "walmart.com",
  "intuit.com",
  "paypal.com",
  "sap.com",
  "vmware.com",
  "wellsfargo.com",
  "tower-research.com",
  "deshaw.com",
  "sprinklr.com",
  "zomato.com",
  "swiggy.com",
];

// For active-jb: `domain` param is NOT supported, use `organization` (exact, case-sensitive)
const TARGET_ORGANIZATIONS = [
  "Google",
  "Microsoft",
  "Amazon",
  "NVIDIA",
  "Adobe",
  "Atlassian",
  "Databricks",
  "Snowflake",
  "Stripe",
  "Cloudflare",
  "Palantir Technologies",
  "Oracle",
  "Cisco",
  "Rubrik",
  "Confluent",
  "MongoDB",
  "Razorpay",
  "CRED",
  "PhonePe",
  "Groww",
  "Meesho",
  "Flipkart",
  "Uber",
  "Airbnb",
  "Salesforce",
  "ServiceNow",
  "Qualcomm",
  "Goldman Sachs",
  "JPMorganChase",
  "American Express",
  "Autodesk",
  "Morgan Stanley",
  "Barclays",
  "Deutsche Bank",
  "Visa",
  "Mastercard",
  "Intel Corporation",
  "Samsung",
  "Walmart",
  "Intuit",
  "PayPal",
  "SAP",
  "VMware",
  "Wells Fargo",
  "Tower Research Capital",
  "D. E. Shaw & Co.",
  "Sprinklr",
  "Zomato",
  "Swiggy",
];

// --- Salary filter (10 LPA minimum) ---

const MIN_SALARY_INR = 1000000;

function meetsMinSalary(job: FantasticJobResponse): boolean {
  if (!job.ai_salary_min_value && !job.ai_salary_max_value) return true;

  const salary = job.ai_salary_max_value || job.ai_salary_min_value || 0;
  const currency = (job.ai_salary_currency || "").toUpperCase();
  const unit = (job.ai_salary_unit_text || "YEAR").toUpperCase();

  let annualInr = salary;
  if (unit === "MONTH") annualInr = salary * 12;
  else if (unit === "HOUR") annualInr = salary * 2080;

  if (currency === "USD") annualInr *= 83;
  else if (currency === "EUR") annualInr *= 90;
  else if (currency === "GBP") annualInr *= 105;

  return annualInr >= MIN_SALARY_INR;
}

// --- Public fetch functions ---

export async function fetchActiveAtsJobs(
  params: FantasticJobsParams = {}
): Promise<FantasticJobResponse[]> {
  const jobs = await fetchAllPages("active-ats", params);
  return jobs.filter(meetsMinSalary);
}

export async function fetchActiveJbJobs(
  params: FantasticJobsParams = {}
): Promise<FantasticJobResponse[]> {
  const jobs = await fetchAllPages("active-jb", params);
  return jobs.filter(meetsMinSalary);
}

export async function fetchExpiredAtsIds(
  timeFrame: "1h" | "1d" | "1m" | "6m" = "1d"
): Promise<number[]> {
  const url = buildUrl("expired-ats", { time_frame: timeFrame });
  const response = await fetchWithRetry(url);
  return response.json();
}

export async function fetchExpiredJbIds(
  timeFrame: "1h" | "1d" | "1m" | "6m" = "1d"
): Promise<number[]> {
  const url = buildUrl("expired-jb", { time_frame: timeFrame });
  const response = await fetchWithRetry(url);
  return response.json();
}

// --- Pagination ---

async function fetchAllPages(
  endpoint: string,
  params: FantasticJobsParams
): Promise<FantasticJobResponse[]> {
  const limit = params.limit || 1000;
  const allJobs: FantasticJobResponse[] = [];
  let offset = params.offset || 0;

  while (true) {
    const url = buildUrl(endpoint, { ...params, limit, offset } as Record<string, string | number | undefined>);
    const response = await fetchWithRetry(url);
    const jobs: FantasticJobResponse[] = await response.json();

    allJobs.push(...jobs);

    if (jobs.length < limit) break;
    offset += limit;
  }

  return allJobs;
}

// --- Default params for sync ---

// ATS: filter by domain (supported), include org details, exclude recruitment agencies
export const DEFAULT_ATS_PARAMS: FantasticJobsParams = {
  time_frame: "24h",
  limit: 1000,
  location: "India",
  ai_experience_level: "0-2",
  ai_employment_type: "INTERN,FULL_TIME",
  title: 'software OR engineer OR developer OR sde OR backend OR frontend OR "full stack" OR devops OR "data engineer" OR "ml engineer" OR intern',
  include_beta: "true",
  description_format: "html",
  domain: TARGET_DOMAINS.join(","),
  include_basic_organization_details: "true",
  organization_agency: "exclude",
};

// JB: domain param NOT supported — use organization (exact names) instead
export const DEFAULT_JB_PARAMS: FantasticJobsParams = {
  time_frame: "24h",
  limit: 1000,
  location: "India",
  ai_experience_level: "0-2",
  ai_employment_type: "INTERN,FULL_TIME",
  title: 'software OR engineer OR developer OR sde OR backend OR frontend OR "full stack" OR devops OR "data engineer" OR "ml engineer" OR intern',
  include_beta: "true",
  description_format: "html",
  organization: TARGET_ORGANIZATIONS.join(","),
  exclude_ats_duplicate: "true",
  organization_agency: "exclude",
};
