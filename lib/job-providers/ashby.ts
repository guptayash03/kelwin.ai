import type { RawJobListing } from "@/types/job";
import type { CompanyConfig, JobProvider } from "./types";
import { isIndiaLocation, isEntryLevelJob } from "./india-filter";

const ASHBY_QUERY = `
  query ApiJobBoardWithTeams($organizationHostedJobsPageName: String!) {
    jobBoard: jobBoardWithTeams(
      organizationHostedJobsPageName: $organizationHostedJobsPageName
    ) {
      teams {
        name
        jobs {
          id
          title
          locationName
          employmentType
          compensationTierSummary
          publishedDate
        }
      }
    }
  }
`;

export class AshbyProvider implements JobProvider {
  platform = "ashby" as const;
  displayName = "Ashby";

  async searchJobs(companies: CompanyConfig[]): Promise<RawJobListing[]> {
    const relevant = companies.filter((c) => c.platforms.ashby);
    const results: RawJobListing[] = [];

    for (const company of relevant) {
      try {
        const slug = company.platforms.ashby!;
        const res = await fetch(
          "https://jobs.ashbyhq.com/api/non-user-graphql?op=ApiJobBoardWithTeams",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              operationName: "ApiJobBoardWithTeams",
              variables: { organizationHostedJobsPageName: slug },
              query: ASHBY_QUERY,
            }),
            signal: AbortSignal.timeout(15000),
          }
        );

        if (!res.ok) continue;

        const data = await res.json();
        const teams = data?.data?.jobBoard?.teams || [];

        for (const team of teams) {
          const jobs = team.jobs || [];
          for (const job of jobs) {
            const location = job.locationName || "";
            if (!isIndiaLocation(location)) continue;
            if (!isEntryLevelJob(job.title)) continue;

            results.push({
              externalId: `ashby-${slug}-${job.id}`,
              title: job.title,
              company: company.name,
              companyDomain: company.domain,
              location,
              applyUrl: `https://jobs.ashbyhq.com/${slug}/${job.id}`,
              sourceUrl: `https://jobs.ashbyhq.com/${slug}/${job.id}`,
              postedDate: job.publishedDate || undefined,
              salary: job.compensationTierSummary || undefined,
              employmentType: job.employmentType || undefined,
              departments: [team.name],
            });
          }
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
