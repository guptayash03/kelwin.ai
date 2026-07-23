import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { JobPlatform, RawJobListing } from "@/types/job";
import type { ParsedResumeData } from "@/types/resume";
import { getJobProvider, COMPANY_REGISTRY } from "@/lib/job-providers";
import { isIndiaLocation } from "@/lib/job-providers/india-filter";
import { normalizeJob } from "@/lib/job-providers/normalize";
import { calculateMatchScore } from "@/lib/job-providers/match-score";

const VALID_PLATFORMS: JobPlatform[] = [
  "greenhouse",
  "lever",
  "ashby",
  "workday",
  "career-portals",
];

export async function POST(request: NextRequest) {
  const session = request.cookies.get("__session")?.value;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { platforms?: JobPlatform[]; resumeData?: ParsedResumeData };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { platforms, resumeData } = body;

  if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
    return NextResponse.json(
      { error: "platforms array is required" },
      { status: 400 }
    );
  }

  const invalidPlatform = platforms.find((p) => !VALID_PLATFORMS.includes(p));
  if (invalidPlatform) {
    return NextResponse.json(
      { error: `Invalid platform: ${invalidPlatform}` },
      { status: 400 }
    );
  }

  if (!resumeData) {
    return NextResponse.json(
      { error: "resumeData is required" },
      { status: 400 }
    );
  }

  try {
    const platformResults: {
      platform: string;
      count: number;
      error?: string;
    }[] = [];

    const providerPromises = platforms.map(async (platform) => {
      try {
        const provider = getJobProvider(platform);
        const rawJobs = await provider.searchJobs(COMPANY_REGISTRY);
        platformResults.push({ platform, count: rawJobs.length });
        return rawJobs.map((raw) => ({ raw, platform }));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown error";
        platformResults.push({ platform, count: 0, error: message });
        return [];
      }
    });

    const allResults = await Promise.allSettled(providerPromises);
    const rawJobs = allResults
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => (r as PromiseFulfilledResult<{ raw: RawJobListing; platform: JobPlatform }[]>).value);

    // Normalize and filter
    const normalizedJobs = rawJobs
      .filter((item) => isIndiaLocation(item.raw.location))
      .map((item) => {
        const normalized = normalizeJob(item.raw, item.platform, "");
        const matchScore = calculateMatchScore(normalized, resumeData);
        return { ...normalized, matchScore };
      });

    // Deduplicate by externalId
    const seen = new Set<string>();
    const dedupedJobs = normalizedJobs.filter((job) => {
      if (seen.has(job.externalId)) return false;
      seen.add(job.externalId);
      return true;
    });

    // Sort by match score descending
    dedupedJobs.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({
      success: true,
      jobs: dedupedJobs,
      platformResults,
    });
  } catch (err) {
    console.error("Job search failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
