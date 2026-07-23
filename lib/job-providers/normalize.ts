import type { JobPlatform, NormalizedJob, RawJobListing } from "@/types/job";

export function normalizeJob(
  raw: RawJobListing,
  platform: JobPlatform,
  userId: string
): Omit<NormalizedJob, "id" | "matchScore" | "fetchedAt"> {
  return {
    externalId: raw.externalId,
    userId,
    platform,
    company: raw.company,
    companyLogo: `https://unavatar.io/${raw.companyDomain}?fallback=false`,
    title: raw.title,
    location: raw.location,
    country: "India",
    salary: raw.salary || null,
    employmentType: raw.employmentType || null,
    experienceLevel: inferExperienceLevel(raw.title),
    description: raw.description || null,
    skills: extractSkills(raw.title, raw.description || "", raw.departments),
    applyUrl: raw.applyUrl,
    sourceUrl: raw.sourceUrl || null,
    saved: false,
    postedDate: raw.postedDate || null,
  };
}

function inferExperienceLevel(title: string): string | null {
  const t = title.toLowerCase();
  if (t.includes("intern")) return "Intern";
  if (t.includes("new grad") || t.includes("fresher") || t.includes("campus")) return "New Grad";
  if (t.includes("junior") || t.includes("jr.") || t.includes("jr ")) return "Junior";
  if (t.includes("associate")) return "Associate";
  if (t.includes("sde 1") || t.includes("sde i") || t.includes("sde-1")) return "Entry Level";
  if (t.includes("2026") || t.includes("2027") || t.includes("2028")) return "New Grad";
  return "Entry Level";
}

const SKILL_KEYWORDS = [
  "python", "java", "javascript", "typescript", "go", "golang", "rust", "c++",
  "c#", "ruby", "scala", "kotlin", "swift", "react", "angular", "vue",
  "node.js", "nodejs", "django", "flask", "spring", "rails",
  "aws", "gcp", "azure", "docker", "kubernetes", "k8s", "terraform",
  "sql", "postgresql", "mongodb", "redis", "elasticsearch", "kafka",
  "graphql", "rest", "grpc", "microservices",
  "machine learning", "ml", "ai", "deep learning", "nlp",
  "ci/cd", "devops", "sre", "linux",
  "react native", "flutter", "ios", "android",
  "distributed systems", "system design", "data structures",
];

function extractSkills(
  title: string,
  description: string,
  departments?: string[]
): string[] {
  const text = `${title} ${description} ${(departments || []).join(" ")}`.toLowerCase();
  const found = SKILL_KEYWORDS.filter((skill) => text.includes(skill));
  return [...new Set(found)].slice(0, 10);
}
