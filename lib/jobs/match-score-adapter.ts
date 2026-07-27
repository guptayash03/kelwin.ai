import { calculateMatchScore } from "@/lib/job-providers/match-score";
import type { CentralJob } from "@/types/central-job";
import type { ParsedResumeData } from "@/types/resume";

const EXPERIENCE_MAP: Record<string, string> = {
  "0-2": "junior",
  "2-5": "mid",
  "5-10": "senior",
  "10+": "staff+",
};

export function scoreCentralJob(
  job: CentralJob,
  resume: ParsedResumeData
): number {
  return calculateMatchScore(
    {
      externalId: String(job.fantasticId),
      userId: "",
      platform: "greenhouse",
      company: job.organization,
      companyLogo: job.organizationLogo || "",
      title: job.title,
      location: job.locationsRaw.join(", "),
      country: job.countries[0] || "",
      salary: job.salaryMin
        ? `${job.salaryCurrency || ""} ${job.salaryMin}-${job.salaryMax || ""}`
        : null,
      employmentType: job.employmentType[0] || null,
      experienceLevel: EXPERIENCE_MAP[job.experienceLevel || ""] || "mid",
      description: null,
      skills: job.skills,
      applyUrl: job.url,
      sourceUrl: null,
      saved: false,
      postedDate: job.datePosted,
    },
    resume
  );
}
