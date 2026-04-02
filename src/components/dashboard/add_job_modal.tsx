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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialValues ? "Edit Job" : "Add Job"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <JobForm
          initialValues={initialValues}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
