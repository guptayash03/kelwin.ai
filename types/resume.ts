export interface ParsedResumeData {
  personalInfo: {
    fullName: string;
    email: string | null;
    phone: string | null;
    location: string | null;
    linkedIn: string | null;
    github: string | null;
    portfolio: string | null;
    website: string | null;
  };
  professionalSummary: string | null;
  skills: {
    technical: string[];
    frameworks: string[];
    languages: string[];
    tools: string[];
    soft: string[];
  };
  experience: Array<{
    company: string;
    title: string;
    employmentType: string | null;
    location: string | null;
    startDate: string;
    endDate: string | null;
    duration: string | null;
    responsibilities: string[];
    technologies: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string | null;
    gpa: string | null;
    grade: string | null;
  }>;
  projects: Array<{
    title: string;
    description: string;
    technologies: string[];
    github: string | null;
    liveUrl: string | null;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string | null;
    url: string | null;
  }>;
  achievements: string[];
  publications: string[];
  volunteerExperience: string[];
  interests: string[];
}

export interface ResumeDocument {
  userId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storagePath: string;
  downloadURL: string;
  uploadedAt: unknown;
  aiProvider: string;
  parsed: boolean;
  parsedAt: unknown | null;
  parsedData: ParsedResumeData | null;
}
