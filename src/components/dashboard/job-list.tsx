import JobCard from "@/components/dashboard/job-card";
import JobListItem from "@/components/dashboard/job-list-item";
import type { Job, JobStage, ViewMode } from "@/types/job";

type JobListProps = {
  jobs: Job[];
  viewMode: ViewMode;
  onEdit?: (job: Job) => void;
  onDelete?: (id: string) => void;
  onStageChange?: (id: string, stage: JobStage) => void;
};

export default function JobList({ jobs, viewMode, onEdit, onDelete, onStageChange }: JobListProps) {
  if (!jobs || jobs.length === 0) {
    return (
      <div className="bg-zinc-900 border border-dashed border-zinc-700 rounded-lg p-10 text-center">
        <svg
          className="mx-auto mb-3 text-zinc-600"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
        <p className="text-sm text-zinc-400">No jobs yet.</p>
        <p className="mt-1 text-xs text-zinc-500">
          Click &quot;Add Job&quot; to start tracking your applications.
        </p>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-2">
        {jobs.map((job) => (
          <JobListItem
            key={job.id}
            job={job}
            onEdit={onEdit}
            onDelete={onDelete}
            onStageChange={onStageChange}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          onEdit={onEdit}
          onDelete={onDelete}
          onStageChange={onStageChange}
        />
      ))}
    </div>
  );
}
