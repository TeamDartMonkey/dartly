"use client";

import JobForm, { type JobFormPayload } from "@/components/dashboard/job-form";
import { Modal } from "@/components/ui/modal";
import type { Job, JobStage } from "@/types/job";

type AddJobModalProps = {
  isOpen: boolean;
  initialValues?: Job | null;
  defaultStage?: JobStage;
  onSubmit: (job: JobFormPayload) => void | Promise<void>;
  onClose: () => void;
};

export default function AddJobModal({
  isOpen,
  initialValues = null,
  defaultStage,
  onSubmit,
  onClose,
}: AddJobModalProps) {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={initialValues ? "Edit Job" : "Add Job"}
      maxWidth="2xl"
    >
      <JobForm
        initialValues={initialValues}
        defaultStage={defaultStage}
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
}
