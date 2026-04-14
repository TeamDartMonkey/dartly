// S2-005: Added click-to-navigate to /dashboard/[jobId].
// Changes from original:
//   - imports useRouter
//   - card container gets onClick + cursor-pointer + hover border
//   - Edit and Delete buttons get e.stopPropagation() so they don't also trigger the card navigation

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Select } from "@/components/ui/select";
import type { Job, JobStage } from "@/types/job";
import { isOverdue } from "@/utils/deadline";

type JobCardProps = {
  job: Job;
  onEdit?: (job: Job) => void;
  onDelete?: (id: string) => void;
  onStageChange?: (id: string, stage: JobStage) => void;
  onArchive?: (id: string) => void;
  onRestore?: (id: string) => Promise<void>;
};

const STAGES: JobStage[] = ["Interested", "Applied", "Interview", "Offer", "Rejected"];

const STAGE_TEXT_STYLES: Record<JobStage, string> = {
  Interested: "text-zinc-400",
  Applied: "text-blue-400",
  Interview: "text-yellow-400",
  Offer: "text-green-400",
  Rejected: "text-red-400",
  Archived: "text-zinc-500",
};

export default function JobCard({ job, onEdit, onDelete, onStageChange, onArchive, onRestore }: JobCardProps) {
  const router = useRouter();
  const [isChangingStage, setIsChangingStage] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const isArchived = job.stage === "Archived";

  async function handleStageChange(val: string) {
    const newStage = val as JobStage;
    if (newStage === job.stage || !onStageChange) return;
    setIsChangingStage(true);
    try {
      await onStageChange(job.id, newStage);
    } finally {
      setIsChangingStage(false);
    }
  }

  async function handleRestore() {
    if (!onRestore) return;
    setIsRestoring(true);
    try {
      await onRestore(job.id);
    } finally {
      setIsRestoring(false);
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 hover:border-zinc-500 rounded-lg shadow-sm p-6 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          className="flex-1 min-w-0 text-left"
          onClick={() => router.push(`/dashboard/${job.id}`)}
          aria-label={`View details for ${job.title} at ${job.company}`}
        >
          <div className="min-w-0">
            <h2 className="text-base font-medium text-zinc-50 truncate">{job.title}</h2>
            <p className="text-sm text-zinc-400">{job.company}</p>
          </div>
          <div className="mt-4 space-y-1 text-sm text-zinc-500">
            {job.location && <p>{job.location}</p>}
            {job.deadline && (
              <p className={isOverdue(job.deadline) ? "text-red-400" : ""}>
                Deadline: {job.deadline}
              </p>
            )}
            <p>Last activity: {job.lastActivityDate}</p>
          </div>
        </button>
        <div className="shrink-0 flex items-center gap-1.5">
          {!isArchived && (
            <>
              {isChangingStage && (
                <svg
                  className="animate-spin text-zinc-500"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              )}
              <Select
                value={job.stage}
                onChange={handleStageChange}
                options={STAGES.map((s) => ({ value: s, label: s }))}
                className="text-xs font-medium"
                textClassName={STAGE_TEXT_STYLES[job.stage]}
              />
            </>
          )}

          {isArchived && (
            <span className="rounded-md px-2.5 py-1 text-xs font-medium bg-zinc-900 text-zinc-500">
              Archived
            </span>
          )}
        </div>
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
              onClick={(e) => {
                e.stopPropagation(); // don't navigate to detail page
                onEdit(job);
              }}
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

          {!isArchived && onArchive && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onArchive(job.id);
              }}
              className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-50 rounded-md px-3 py-1 text-xs font-medium"
              aria-label={`Archive ${job.title}`}
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
                <polyline points="21 8 21 21 3 21 3 8" />
                <rect x="1" y="3" width="22" height="5" />
                <line x1="10" y1="12" x2="14" y2="12" />
              </svg>
            </button>
          )}

          {isArchived && onRestore && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRestore();
              }}
              disabled={isRestoring}
              className="bg-green-800 hover:bg-green-700 text-zinc-50 rounded-md px-3 py-1 text-xs font-medium"
              aria-label={`Restore ${job.title}`}
            >
              {isRestoring ? (
                <svg
                  className="animate-spin text-zinc-500"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
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
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <polyline points="3 3 3 8 8 8" />
                </svg>
              )}
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // don't navigate to detail page
                onDelete(job.id);
              }}
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
