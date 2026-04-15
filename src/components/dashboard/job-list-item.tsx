"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Select } from "@/components/ui/select";
import { STAGE_TEXT_STYLES, STAGES } from "@/constants/job-stages";
import type { Job, JobStage } from "@/types/job";
import { isOverdue } from "@/utils/deadline";

type JobListItemProps = {
  job: Job;
  onEdit?: (job: Job) => void;
  onDelete?: (id: string) => void;
  onStageChange?: (id: string, stage: JobStage) => void;
};

export default function JobListItem({ job, onEdit, onDelete, onStageChange }: JobListItemProps) {
  const router = useRouter();
  const [isChangingStage, setIsChangingStage] = useState(false);

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
            {job.deadline && (
              <span
                className={`whitespace-nowrap${isOverdue(job.deadline) ? " text-red-400" : ""}`}
              >
                Deadline: {job.deadline}
              </span>
            )}
            <span className="whitespace-nowrap">Last activity: {job.lastActivityDate}</span>
          </div>
        </button>

        <div className="shrink-0 flex items-center gap-3 pt-0.5">
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
            <Select
              value={job.stage}
              onChange={handleStageChange}
              options={STAGES.map((s) => ({ value: s, label: s }))}
              className="w-[110px] text-xs font-medium"
              textClassName={STAGE_TEXT_STYLES[job.stage]}
            />
          </div>

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
