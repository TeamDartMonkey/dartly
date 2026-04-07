"use client";

import JobForm from "@/components/dashboard/job-form";
import { Modal } from "@/components/ui/modal";
import type { Job } from "@/types/job";

type AddJobModalProps = {
  isOpen: boolean;
  initialValues?: Job | null;
  onSubmit: (job: Omit<Job, "id"> & { id?: string }) => void;
  onClose: () => void;
};

export default function AddJobModal({
  isOpen,
  initialValues = null,
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
      <JobForm initialValues={initialValues} onSubmit={onSubmit} onCancel={onClose} />
    </Modal>
  );
}
