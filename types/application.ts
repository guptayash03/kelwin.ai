export type ApplicationStatus =
  | "queued"
  | "detecting_platform"
  | "analyzing_application"
  | "comparing_profile"
  | "missing_profile_info"
  | "ready_to_apply"
  | "applying"
  | "uploading_resume"
  | "generating_ai_answers"
  | "submitting"
  | "applied"
  | "failed";

export type TaskType = "analysis" | "submission";

export type QueueStatus = "pending" | "processing" | "completed" | "failed";

export interface DetectedField {
  fieldId: string;
  label: string;
  type:
    | "text"
    | "email"
    | "phone"
    | "url"
    | "select"
    | "textarea"
    | "file"
    | "checkbox"
    | "radio";
  required: boolean;
  options?: string[];
  validationRules?: string;
  mappedProfileField?: string;
  value?: string;
}

export interface ScreeningQuestion {
  questionId: string;
  question: string;
  type: "text" | "textarea" | "select" | "radio";
  required: boolean;
  options?: string[];
  aiGeneratedAnswer?: string;
}

export interface ApplicationDocument {
  id?: string;
  userId: string;
  jobId: string;
  platform: string;
  jobUrl: string;
  jobTitle: string;
  company: string;
  companyLogo: string;
  status: ApplicationStatus;
  detectedFields: DetectedField[];
  screeningQuestions: ScreeningQuestion[];
  missingFields: string[];
  currentTaskType: TaskType | null;
  confirmationMessage: string | null;
  confirmationUrl: string | null;
  failureReason: string | null;
  retryCount: number;
  submittedAt: unknown | null;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface ApplicationQueueDocument {
  id?: string;
  userId: string;
  applicationId: string;
  taskType: TaskType;
  queueStatus: QueueStatus;
  cloudTaskName: string | null;
  retryCount: number;
  workerId: string | null;
  startedAt: unknown | null;
  completedAt: unknown | null;
  createdAt: unknown;
}

export const ACTIVE_STATUSES: ApplicationStatus[] = [
  "detecting_platform",
  "analyzing_application",
  "comparing_profile",
  "ready_to_apply",
  "applying",
  "uploading_resume",
  "generating_ai_answers",
  "submitting",
];

export const TERMINAL_STATUSES: ApplicationStatus[] = [
  "applied",
  "failed",
];
