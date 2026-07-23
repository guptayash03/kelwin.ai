import type { RawJobListing } from "@/types/job";
import type { CompanyConfig, JobProvider } from "./types";
import { isIndiaLocation, isEntryLevelJob } from "./india-filter";

export class GreenhouseProvider implements JobProvider {
  platform = "greenhouse" as const;
  displayName = "Greenhouse";

  async searchJobs(companies: CompanyConfig[]): Promise<RawJobListing[]> {
    const relevant = companies.filter((c) => c.platforms.greenhouse);
    const results: RawJobListing[] = [];

    for (const company of relevant) {
      try {
        const token = company.platforms.greenhouse!;
        const res = await fetch(
          `https://boards-api.greenhouse.io/v1/boards/${token}/jobs?content=true`,
          { signal: AbortSignal.timeout(15000) }
        );

        if (!res.ok) continue;

        const data = await res.json();
        const jobs = data.jobs || [];

        for (const job of jobs) {
          const location = job.location?.name || "";
          if (!isIndiaLocation(location)) continue;

          const desc = stripHtml(job.content || "");
          if (!isEntryLevelJob(job.title, desc)) continue;

          results.push({
            externalId: `gh-${token}-${job.id}`,
            title: job.title,
            company: company.name,
            companyDomain: company.domain,
            location,
            description: stripHtml(job.content || ""),
            applyUrl: job.absolute_url,
            sourceUrl: job.absolute_url,
            postedDate: job.updated_at
              ? new Date(job.updated_at).toISOString().split("T")[0]
              : undefined,
            departments: job.departments?.map(
              (d: { name: string }) => d.name
            ),
          });
        }

        await delay(200);
      } catch {
        // Individual company failures don't break the batch
      }
    }

    return results;
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 1000);
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
