"use client";

import JobForm from "@/components/dashboard/job_form";
import type { Job } from "@/types/job";

type AddJobModalProps = {
  isOpen: boolean;
  initialValues?: Job | null;
  onSubmit: (job: Job) => void;
  onClose: () => void;
};

export default function AddJobModal({
  isOpen,
  initialValues = null,
  onSubmit,
  onClose,
}: AddJobModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-lg shadow-sm p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-50">
            {initialValues ? "Edit Job" : "Add Job"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-50 rounded-md px-2.5 py-1 text-sm"
            aria-label="Close modal"
          >
            &#x2715;
          </button>
        </div>
        <JobForm initialValues={initialValues} onSubmit={onSubmit} onCancel={onClose} />
      </div>
    </div>
  );
}
