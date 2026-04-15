import JobCard from "@/components/dashboard/job-card";
import JobListItem from "@/components/dashboard/job-list-item";
import type { Job, JobStage, ViewMode } from "@/types/job";

type JobListProps = {
  jobs: Job[];
  viewMode: ViewMode;
  onAdd?: () => void;
  onEdit?: (job: Job) => void;
  onDelete?: (id: string) => void;
  onStageChange?: (id: string, stage: JobStage) => void;
  onArchive?: (id: string) => void;
  onRestore?: (id: string) => Promise<void>;
};

function AddJobCard({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-700 bg-zinc-900/50 text-sm text-indigo-400 transition-colors hover:border-zinc-600 hover:text-indigo-300"
    >
      <svg
        className="text-zinc-600"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
      + Add job
    </button>
  );
}

function AddJobRow({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-lg border border-dashed border-zinc-700 py-3 text-sm text-indigo-400 transition-colors hover:border-zinc-600 hover:text-indigo-300"
    >
      + Add job
    </button>
  );
}

export default function JobList({
  jobs,
  viewMode,
  onAdd,
  onEdit,
  onDelete,
  onStageChange,
  onArchive,
  onRestore,
}: JobListProps) {
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
        <button
          type="button"
          onClick={onAdd}
          className="mt-2 text-sm text-indigo-400 hover:text-indigo-300"
        >
          + Add your first job
        </button>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-2">
        <AddJobRow onClick={onAdd} />
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
      <AddJobCard onClick={onAdd} />
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          onEdit={onEdit}
          onDelete={onDelete}
          onStageChange={onStageChange}
          onArchive={onArchive}
          onRestore={onRestore}
        />
      ))}
    </div>
  );
}
