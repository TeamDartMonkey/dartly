import type { Job } from "@/types/job";

export type SortKey = "recent" | "company" | "priority" | "deadline" | "created";

export function sortJobs(jobs: Job[], sortBy: SortKey): Job[] {
  return [...jobs].sort((a, b) => {
    if (sortBy === "deadline") {
      const da = a.deadline ?? "9999";
      const db = b.deadline ?? "9999";
      return da.localeCompare(db) || b.createdAt.localeCompare(a.createdAt);
    }
    if (sortBy === "created") {
      return b.createdAt.localeCompare(a.createdAt);
    }
    if (sortBy === "company") return a.company.localeCompare(b.company);
    if (sortBy === "priority") return (b.priority ? 1 : 0) - (a.priority ? 1 : 0);
    return b.lastActivityDate.localeCompare(a.lastActivityDate);
  });
}
