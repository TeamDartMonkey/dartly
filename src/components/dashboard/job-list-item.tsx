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
    <div className="bg-zinc-900 border border-zinc-700 hover:border-zinc-500 rounded-lg px-4 py-3 transition-colors">
      <div className="flex items-center gap-3">
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
          </div>
        </button>

        <div className="shrink-0 flex items-center gap-1.5">
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
        </div>

        <span
          className={`shrink-0 w-20 text-xs text-right ${job.deadline ? (isOverdue(job.deadline) ? "text-red-400" : "text-zinc-500") : "invisible"}`}
        >
          {job.deadline}
        </span>

        <span className={`shrink-0 w-16 text-center ${job.priority ? "" : "invisible"}`}>
          <span className="bg-yellow-950 text-yellow-400 rounded px-1.5 py-0.5 text-xs font-medium">
            Priority
          </span>
        </span>

        <div className="shrink-0 flex gap-1.5">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(job);
              }}
              className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-50 rounded-md px-2 py-1 text-xs font-medium"
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
              onClick={(e) => {
                e.stopPropagation();
                onDelete(job.id);
              }}
              className="bg-red-600 hover:bg-red-700 text-zinc-50 rounded-md px-2 py-1 text-xs font-medium"
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
