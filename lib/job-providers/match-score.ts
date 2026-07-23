import type { ParsedResumeData } from "@/types/resume";
import type { NormalizedJob } from "@/types/job";

export function calculateMatchScore(
  job: Omit<NormalizedJob, "id" | "matchScore" | "fetchedAt">,
  resume: ParsedResumeData
): number {
  let score = 0;

  // Skills match (40%)
  score += skillsScore(job, resume) * 0.4;

  // Experience level match (25%)
  score += experienceScore(job, resume) * 0.25;

  // Title relevance (20%)
  score += titleScore(job, resume) * 0.2;

  // Location match (15%)
  score += locationScore(job, resume) * 0.15;

  return Math.min(100, Math.round(score));
}

function skillsScore(
  job: Omit<NormalizedJob, "id" | "matchScore" | "fetchedAt">,
  resume: ParsedResumeData
): number {
  const userSkills = [
    ...resume.skills.technical,
    ...resume.skills.frameworks,
    ...resume.skills.languages,
    ...resume.skills.tools,
  ].map((s) => s.toLowerCase());

  if (userSkills.length === 0) return 50;

  const jobSkills = job.skills.map((s) => s.toLowerCase());
  if (jobSkills.length === 0) return 60;

  const matchCount = jobSkills.filter((js) =>
    userSkills.some((us) => us.includes(js) || js.includes(us))
  ).length;

  return Math.round((matchCount / jobSkills.length) * 100);
}

function experienceScore(
  job: Omit<NormalizedJob, "id" | "matchScore" | "fetchedAt">,
  resume: ParsedResumeData
): number {
  const yearsOfExp = estimateYears(resume.experience);
  const jobLevel = job.experienceLevel?.toLowerCase() || "mid";

  const levelYearsMap: Record<string, [number, number]> = {
    intern: [0, 1],
    junior: [0, 2],
    mid: [2, 5],
    senior: [4, 10],
    lead: [6, 15],
    "staff+": [8, 20],
  };

  const [min, max] = levelYearsMap[jobLevel] || [2, 5];

  if (yearsOfExp >= min && yearsOfExp <= max) return 100;
  if (yearsOfExp < min) return Math.max(40, 100 - (min - yearsOfExp) * 20);
  return Math.max(50, 100 - (yearsOfExp - max) * 10);
}

function titleScore(
  job: Omit<NormalizedJob, "id" | "matchScore" | "fetchedAt">,
  resume: ParsedResumeData
): number {
  const jobTitle = job.title.toLowerCase();
  const userTitles = resume.experience.map((e) => e.title.toLowerCase());

  const titleKeywords = [
    "software", "engineer", "developer", "backend", "frontend",
    "full stack", "fullstack", "devops", "sre", "platform",
    "data", "ml", "ai", "mobile", "ios", "android", "security",
  ];

  const jobKeywords = titleKeywords.filter((k) => jobTitle.includes(k));
  if (jobKeywords.length === 0) return 50;

  const userKeywords = new Set(
    userTitles.flatMap((t) => titleKeywords.filter((k) => t.includes(k)))
  );

  const overlap = jobKeywords.filter((k) => userKeywords.has(k)).length;
  return Math.round((overlap / jobKeywords.length) * 100);
}

function locationScore(
  job: Omit<NormalizedJob, "id" | "matchScore" | "fetchedAt">,
  resume: ParsedResumeData
): number {
  const jobLoc = job.location.toLowerCase();
  const userLoc = (resume.personalInfo.location || "").toLowerCase();

  if (jobLoc.includes("remote")) return 100;
  if (!userLoc) return 70;

  const cities = [
    "bengaluru", "bangalore", "hyderabad", "pune", "mumbai",
    "delhi", "noida", "gurgaon", "gurugram", "chennai", "kolkata",
  ];

  const userCity = cities.find((c) => userLoc.includes(c));
  if (userCity && jobLoc.includes(userCity)) return 100;
  if (userCity === "bangalore" && jobLoc.includes("bengaluru")) return 100;
  if (userCity === "bengaluru" && jobLoc.includes("bangalore")) return 100;
  if (userCity === "gurgaon" && jobLoc.includes("gurugram")) return 100;
  if (userCity === "gurugram" && jobLoc.includes("gurgaon")) return 100;

  return 60;
}

function estimateYears(
  experience: ParsedResumeData["experience"]
): number {
  if (experience.length === 0) return 0;

  let totalMonths = 0;
  for (const exp of experience) {
    const start = parseYear(exp.startDate);
    const end = exp.endDate ? parseYear(exp.endDate) : new Date().getFullYear();
    if (start && end) {
      totalMonths += (end - start) * 12;
    }
  }

  return Math.max(0, Math.round(totalMonths / 12));
}

function parseYear(dateStr: string): number | null {
  const match = dateStr.match(/(\d{4})/);
  return match ? parseInt(match[1], 10) : null;
}
