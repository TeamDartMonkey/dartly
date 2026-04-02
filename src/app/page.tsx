"use client";

import { useState } from "react";
import AddJobModal from "@/components/dashboard/add_job_modal";
import JobCardList from "@/components/dashboard/job_card_list";
import type { Job } from "@/types/job";

const initialJobs: Job[] = [
  {
    id: "1",
    title: "Software Engineer Intern",
    company: "Google",
    stage: "Applied",
    lastActivityDate: "03/24/2026",
    location: "Mountain View, CA",
    priority: true,
  },
];

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  function handleAddClick() {
    setEditingJob(null);
    setShowForm(true);
  }

  function handleEditClick(job: Job) {
    setEditingJob(job);
    setShowForm(true);
  }
  function handleDelete(id: string) {
    setJobs((currentJobs) =>
      currentJobs.filter((job) => job.id !== id)
    );
  }
  function handleSave(job: Job) {
    setJobs((currentJobs) => {
      const exists = currentJobs.some((currentJob) => currentJob.id === job.id);

      if (exists) {
        return currentJobs.map((currentJob) =>
          currentJob.id === job.id ? job : currentJob,
        );
      }

      return [job, ...currentJobs];
    });

    setShowForm(false);
    setEditingJob(null);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingJob(null);
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">Track and manage your job applications.</p>
          </div>

          <button
            type="button"
            onClick={handleAddClick}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Add Job
          </button>
        </div>

        <JobCardList
          jobs={jobs}
          onEdit={handleEditClick}
          onDelete={handleDelete}
        />
      </div>

      <AddJobModal
        isOpen={showForm}
        initialValues={editingJob}
        onSubmit={handleSave}
        onClose={handleCancel}
      />
    </main>
  );
}