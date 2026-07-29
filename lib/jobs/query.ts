import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  type Query,
  type DocumentData,
  type QueryDocumentSnapshot,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { JobFilters } from "@/types/central-job";

const PAGE_SIZE = 25;

export function buildJobQuery(
  filters: JobFilters,
  lastDoc?: QueryDocumentSnapshot<DocumentData> | null,
  pageSize: number = PAGE_SIZE
): Query<DocumentData> {
  const constraints: QueryConstraint[] = [
    where("status", "==", "active"),
  ];

  if (filters.experienceLevel) {
    constraints.push(where("_experienceLevel", "==", filters.experienceLevel.toLowerCase()));
  }

  if (filters.workArrangement) {
    constraints.push(where("_workArrangement", "==", filters.workArrangement.toLowerCase()));
  }

  if (filters.source) {
    constraints.push(where("_source", "==", filters.source.toLowerCase()));
  }

  constraints.push(orderBy("lastSyncedAt", "desc"));
  constraints.push(limit(pageSize));

  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  return query(collection(db, "centralJobs"), ...constraints);
}

export function applyClientFilters(
  jobs: Array<{ data: DocumentData; id: string }>,
  filters: JobFilters
): Array<{ data: DocumentData; id: string }> {
  return jobs.filter(({ data }) => {
    if (filters.experienceLevel) {
      const level = (data._experienceLevel as string) || "";
      if (level !== filters.experienceLevel.toLowerCase()) return false;
    }

    if (filters.workArrangement) {
      const arrangement = (data._workArrangement as string) || "";
      if (arrangement !== filters.workArrangement.toLowerCase()) return false;
    }

    if (filters.source) {
      const source = (data._source as string) || "";
      if (source !== filters.source.toLowerCase()) return false;
    }

    if (filters.employmentType) {
      const types = (data._employmentTypes as string[]) || [];
      if (!types.includes(filters.employmentType.toLowerCase())) return false;
    }

    if (filters.salaryMin !== undefined && filters.salaryMin !== null) {
      if (!data.salaryMin || data.salaryMin < filters.salaryMin) return false;
    }

    if (filters.salaryMax !== undefined && filters.salaryMax !== null) {
      if (!data.salaryMax || data.salaryMax > filters.salaryMax) return false;
    }

    if (filters.company) {
      const org = (data.organization as string || "").toLowerCase();
      if (!org.includes(filters.company.toLowerCase())) return false;
    }

    if (filters.keyword) {
      const title = (data.title as string || "").toLowerCase();
      const org = (data.organization as string || "").toLowerCase();
      const kw = filters.keyword.toLowerCase();
      if (!title.includes(kw) && !org.includes(kw)) return false;
    }

    return true;
  });
}
