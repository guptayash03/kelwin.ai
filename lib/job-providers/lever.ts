import type { RawJobListing } from "@/types/job";
import type { CompanyConfig, JobProvider } from "./types";
import { isIndiaLocation, isEntryLevelJob } from "./india-filter";

export class LeverProvider implements JobProvider {
  platform = "lever" as const;
  displayName = "Lever";

  async searchJobs(companies: CompanyConfig[]): Promise<RawJobListing[]> {
    const relevant = companies.filter((c) => c.platforms.lever);
    const results: RawJobListing[] = [];

    for (const company of relevant) {
      try {
        const slug = company.platforms.lever!;
        const res = await fetch(
          `https://api.lever.co/v0/postings/${slug}?mode=json`,
          { signal: AbortSignal.timeout(15000) }
        );

        if (!res.ok) continue;

        const postings = await res.json();
        if (!Array.isArray(postings)) continue;

        for (const posting of postings) {
          const location = posting.categories?.location || "";
          if (!isIndiaLocation(location)) continue;

          const desc = posting.descriptionPlain || "";
          if (!isEntryLevelJob(posting.text, desc)) continue;

          results.push({
            externalId: `lever-${slug}-${posting.id}`,
            title: posting.text,
            company: company.name,
            companyDomain: company.domain,
            location,
            description: posting.descriptionPlain?.slice(0, 1000),
            applyUrl: posting.hostedUrl || posting.applyUrl,
            sourceUrl: posting.hostedUrl,
            postedDate: posting.createdAt
              ? new Date(posting.createdAt).toISOString().split("T")[0]
              : undefined,
            employmentType: posting.categories?.commitment || undefined,
            departments: posting.categories?.team
              ? [posting.categories.team]
              : undefined,
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

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
