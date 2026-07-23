import type { RawJobListing } from "@/types/job";
import type { CompanyConfig, JobProvider } from "./types";
import { isEntryLevelJob } from "./india-filter";

export class WorkdayProvider implements JobProvider {
  platform = "workday" as const;
  displayName = "Workday";

  async searchJobs(companies: CompanyConfig[]): Promise<RawJobListing[]> {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      throw new Error("FIRECRAWL_API_KEY is not configured");
    }

    const relevant = companies.filter((c) => c.platforms.workday);
    const results: RawJobListing[] = [];

    for (const company of relevant) {
      try {
        const domain = company.platforms.workday!;
        const query = `site:${domain} entry level Software Engineer India new grad 2026 2027`;

        const res = await fetch("https://api.firecrawl.dev/v1/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            query,
            limit: 10,
          }),
          signal: AbortSignal.timeout(30000),
        });

        if (!res.ok) continue;

        const data = await res.json();
        const searchResults = data.data || [];

        for (const result of searchResults) {
          if (!result.url || !result.title) continue;
          if (!isJobResult(result.title)) continue;
          if (!isEntryLevelJob(result.title, result.description || "")) continue;

          results.push({
            externalId: `wd-${company.domain}-${hashString(result.url)}`,
            title: cleanTitle(result.title),
            company: company.name,
            companyDomain: company.domain,
            location: extractLocation(
              result.title + " " + (result.description || "")
            ),
            description: result.description?.slice(0, 1000),
            applyUrl: result.url,
            sourceUrl: result.url,
          });
        }

        await delay(500);
      } catch {
        // Individual company failures don't break the batch
      }
    }

    return results;
  }
}

function isJobResult(title: string): boolean {
  const t = title.toLowerCase();
  const jobKeywords = [
    "engineer", "developer", "sde", "swe", "architect",
    "devops", "sre", "scientist", "analyst",
  ];
  return jobKeywords.some((k) => t.includes(k));
}

function cleanTitle(title: string): string {
  return title
    .replace(/\s*[-|–]\s*Workday.*$/i, "")
    .replace(/\s*[-|–]\s*Job Details.*$/i, "")
    .trim();
}

function extractLocation(text: string): string {
  const locations = [
    "Bengaluru", "Bangalore", "Hyderabad", "Pune", "Mumbai",
    "Delhi", "Noida", "Gurgaon", "Gurugram", "Chennai",
    "Kolkata", "Remote",
  ];
  const found = locations.find((loc) =>
    text.toLowerCase().includes(loc.toLowerCase())
  );
  return found || "India";
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
