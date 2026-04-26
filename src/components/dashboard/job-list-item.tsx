"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BadgePicker } from "@/components/ui/badge-picker";
import { STAGES, STAGE_STYLES } from "@/constants/job-stages";
import type { Job, JobStage } from "@/types/job";
import { getUrgency, URGENCY_STYLES } from "@/utils/deadline";

type JobListItemProps = {
  job: Job;
  onEdit?: (job: Job) => void;
  onDelete?: (id: string) => void;
  onStageChange?: (id: string, stage: JobStage) => void;
  onRestore?: (id: string) => Promise<void>;
};

function getStageOptions(_currentStage: JobStage) {
  return STAGES.map((s) => {
    const style = STAGE_STYLES[s];
    return { value: s, label: s, badge: style.badge, dot: style.dot };
  });
}

export default function JobListItem({ job, onEdit, onDelete, onStageChange, onRestore }: JobListItemProps) {
  const router = useRouter();
  const [isChangingStage, setIsChangingStage] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const isArchived = job.stage === "Archived";
  const isInactive = isArchived;
  const showStageDropdown = onStageChange && !isArchived && !isChangingStage;
  const stageOptions = getStageOptions(job.stage);

  const urgency = job.stage === "Interested" ? getUrgency(job.deadline) : "none";
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
    <div className="bg-zinc-900 border border-zinc-700 hover:border-zinc-500 rounded-lg px-5 py-4 transition-colors">
      <div className="flex items-start gap-4">
        <button
          type="button"
          className="flex-1 min-w-0 text-left"
          onClick={() => router.push(`/dashboard/${job.id}`)}
          aria-label={`View details for ${job.title} at ${job.company}`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-medium text-zinc-50 truncate">{job.title}</span>
            <span className="text-sm text-zinc-500 shrink-0">at</span>
            <span className="text-sm text-zinc-400 truncate">{job.company}</span>
            {job.priority && (
              <span className="shrink-0 bg-yellow-950 text-yellow-400 rounded px-1.5 py-0.5 text-xs font-medium">
                Priority
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
            {job.location && <span>{job.location}</span>}
            {job.stage === "Interested" && job.deadline && <span className="whitespace-nowrap">Deadline: {job.deadline}</span>}
            <span className="whitespace-nowrap">Last activity: {job.lastActivityDate}</span>
          </div>
        </button>

        <div className="shrink-0 flex items-center gap-2 pt-0.5">
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

          {showStageDropdown && (
            <BadgePicker
              value={job.stage}
              options={stageOptions}
              onChange={(val) => handleStageChange(val)}
              disabled={isChangingStage}
            />
          )}

          {(isInactive || !showStageDropdown) && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium ${STAGE_STYLES[job.stage].badge}`}
            >
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${STAGE_STYLES[job.stage].dot}`}
              />
              {job.stage}
            </span>
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
    </div>
  );
}
