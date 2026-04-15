import { useRouter } from "next/navigation";
import { useState } from "react";
import { BadgePicker } from "@/components/ui/badge-picker";
import { ACTIVE_STAGES, STAGE_STYLES } from "@/constants/job-stages";
import type { Job, JobStage } from "@/types/job";
import { getUrgency, URGENCY_STYLES } from "@/utils/deadline";

type JobCardProps = {
  job: Job;
  onEdit?: (job: Job) => void;
  onDelete?: (id: string) => void;
  onStageChange?: (id: string, stage: JobStage) => void;
  onArchive?: (id: string) => void;
  onRestore?: (id: string) => Promise<void>;
};

const STAGE_OPTIONS = ACTIVE_STAGES.map((s) => {
  const style = STAGE_STYLES[s];
  return { value: s, label: s, badge: style.badge, dot: style.dot };
});

export default function JobCard({
  job,
  onEdit,
  onDelete,
  onStageChange,
  onArchive,
  onRestore,
}: JobCardProps) {
  const router = useRouter();
  const [isChangingStage, setIsChangingStage] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const isArchived = job.stage === "Archived";

  const urgency = getUrgency(job.deadline);
  const urgencyStyle = URGENCY_STYLES[urgency];

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
    <div className="group relative flex flex-col bg-zinc-900 border border-zinc-700 hover:border-zinc-500 rounded-lg shadow-sm p-6 transition-colors">
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
        </button>

        <div className="flex shrink-0 items-center gap-1">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(job);
              }}
              className="p-1.5 text-zinc-500 transition-colors hover:text-indigo-400"
              aria-label="Edit"
              title="Edit"
            >
              ✎
            </button>
          )}

          {!isArchived && onArchive && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onArchive(job.id);
              }}
              className="p-1.5 text-zinc-600 transition-colors hover:text-orange-400"
              aria-label="Archive"
              title="Archive"
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
              className="p-1.5 text-zinc-600 transition-colors hover:text-green-400"
              aria-label="Restore"
              title="Restore"
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
                e.stopPropagation();
                onDelete(job.id);
              }}
              className="p-1.5 text-zinc-600 transition-colors hover:text-red-400"
              aria-label="Delete"
              title="Delete"
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
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <button
        type="button"
        className="flex-1 min-w-0 text-left"
        onClick={() => router.push(`/dashboard/${job.id}`)}
        aria-label={`View details for ${job.title} at ${job.company}`}
      >
        <div className="mt-4 space-y-1 text-sm text-zinc-500">
          {job.location && <p>{job.location}</p>}
          {job.deadline && <p className="whitespace-nowrap">Deadline: {job.deadline}</p>}
          <p className="whitespace-nowrap">Last activity: {job.lastActivityDate}</p>
        </div>
      </button>

      <div className="mt-auto flex items-center justify-between pt-4">
        <div className="flex items-center gap-1.5">
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

          {!isArchived && onStageChange && (
            <BadgePicker
              value={job.stage}
              options={STAGE_OPTIONS}
              onChange={(val) => handleStageChange(val)}
              disabled={isChangingStage}
            />
          )}

          {(isArchived || !onStageChange) && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium ${STAGE_STYLES[job.stage].badge}`}
            >
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${STAGE_STYLES[job.stage].dot}`}
              />
              {job.stage}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {urgency !== "none" && (
            <span
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium ${urgencyStyle.badge}`}
            >
              {urgency === "overdue" && (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              )}
              {urgency === "due-soon" && (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              )}
              {urgencyStyle.label}
            </span>
          )}

          {job.priority && (
            <span className="bg-yellow-950 text-yellow-400 rounded-md px-2 py-1 text-xs font-medium">
              Priority
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
