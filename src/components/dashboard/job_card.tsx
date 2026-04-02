import type { Job, JobStage } from "@/types/job";

type JobCardProps = {
  job: Job;
  onEdit?: (job: Job) => void;
  onDelete?: (id: string) => void;
};

const STAGE_STYLES: Record<JobStage, string> = {
  Interested: "bg-zinc-900 text-zinc-400",
  Applied: "bg-blue-950 text-blue-400",
  Interview: "bg-yellow-950 text-yellow-400",
  Offer: "bg-green-950 text-green-400",
  Rejected: "bg-red-950 text-red-400",
  Archived: "bg-zinc-900 text-zinc-500",
};

export default function JobCard({ job, onEdit, onDelete }: JobCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-sm p-6">
      {/* Top: Title + Stage */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-medium text-zinc-50 truncate">
            {job.title}
          </h2>
          <p className="text-sm text-zinc-400">{job.company}</p>
        </div>
        <span
          className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-medium ${STAGE_STYLES[job.stage]}`}
        >
          {job.stage}
        </span>
      </div>

      {/* Details */}
      <div className="mt-4 space-y-1 text-sm text-zinc-500">
        {job.location && <p>{job.location}</p>}
        <p>Last activity: {job.lastActivityDate}</p>
      </div>

      {/* Bottom: Priority + Actions */}
      <div className="mt-4 flex items-center justify-between">
        {job.priority ? (
          <span className="bg-yellow-950 text-yellow-400 rounded-md px-2 py-1 text-xs font-medium">
            Priority
          </span>
        ) : (
          <div />
        )}

        <div className="flex gap-2">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(job)}
              className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-50 rounded-md px-3 py-1 text-xs font-medium"
              aria-label={`Edit ${job.title}`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(job.id)}
              className="bg-red-600 hover:bg-red-700 text-zinc-50 rounded-md px-3 py-1 text-xs font-medium"
              aria-label={`Delete ${job.title}`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
