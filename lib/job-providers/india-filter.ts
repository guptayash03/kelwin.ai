const INDIA_LOCATIONS = [
  "india",
  "bengaluru",
  "bangalore",
  "hyderabad",
  "pune",
  "mumbai",
  "delhi",
  "ncr",
  "noida",
  "gurgaon",
  "gurugram",
  "chennai",
  "kolkata",
  "ahmedabad",
  "jaipur",
  "kochi",
  "thiruvananthapuram",
  "coimbatore",
  "indore",
  "remote - india",
  "remote india",
  "remote, india",
  "remote (india)",
  "in-remote",
  "anywhere in india",
];

export function isIndiaLocation(location: string): boolean {
  const normalized = location.toLowerCase().trim();
  return INDIA_LOCATIONS.some((loc) => normalized.includes(loc));
}

const ENTRY_LEVEL_KEYWORDS = [
  "intern", "internship",
  "new grad", "new graduate", "newgrad",
  "entry level", "entry-level",
  "junior", "jr.", "jr ",
  "associate",
  "fresh", "fresher",
  "campus", "university",
  "2026", "2027", "2028",
  "graduate", "graduating",
  "sde 1", "sde i", "sde-1", "sde-i",
  "software engineer i",
  "software engineer 1",
  "software development engineer i",
  "software development engineer 1",
  "early career", "early-career",
  "early in career",
  "analyst",
];

const SENIOR_KEYWORDS = [
  "senior", "sr.", "sr ",
  "staff", "principal", "distinguished",
  "lead", "manager", "director",
  "architect", "vp", "head of",
  "sde 3", "sde iii", "sde-3",
  "sde 2", "sde ii", "sde-2",
  "software engineer iii",
  "software engineer 3",
  "10+ years", "8+ years", "7+ years",
  "6+ years", "5+ years",
];

export function isEntryLevelJob(title: string, description?: string): boolean {
  const text = `${title} ${description || ""}`.toLowerCase();

  if (SENIOR_KEYWORDS.some((k) => text.includes(k))) {
    return false;
  }

  if (ENTRY_LEVEL_KEYWORDS.some((k) => text.includes(k))) {
    return true;
  }

  const t = title.toLowerCase();
  if (
    (t.includes("software engineer") || t.includes("sde") || t.includes("developer")) &&
    !SENIOR_KEYWORDS.some((k) => t.includes(k))
  ) {
    return true;
  }

  return false;
}
