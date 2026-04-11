import type { Job } from "@/types/job";

export function searchJobs(jobs: Job[], query: string): Job[] {
  if (!query) return jobs;

  const q = query.toLowerCase();

  return jobs.filter((job) => {
    const fields = [job.title, job.company, job.location, job.description, job.customNotes];

    return fields.some((field) => field?.toLowerCase().includes(q));
  });
}
