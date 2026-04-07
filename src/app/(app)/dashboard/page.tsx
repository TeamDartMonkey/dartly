"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AddJobModal from "@/components/dashboard/add_job_modal";
import JobCardList from "@/components/dashboard/job_card_list";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { Select } from "@/components/ui/select";
import { DashboardSkeleton } from "@/components/ui/skeletons/dashboard-skeleton";
import { showToast } from "@/components/ui/toast";
import type { Job, JobStage } from "@/types/job";

const STAGES: JobStage[] = ["Interested", "Applied", "Interview", "Offer", "Rejected", "Archived"];

export default function DashboardPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<JobStage | "">("");
  const [sortBy, setSortBy] = useState<"recent" | "company" | "priority">("recent");
  const [pendingDeleteJob, setPendingDeleteJob] = useState<Job | null>(null);

  useEffect(() => {
    fetch("/api/jobs")
      .then((res) => {
        if (res.status === 401) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data)) setJobs(data);
      })
      .finally(() => setLoading(false));
  }, [router]);

  function handleAddClick() {
    setEditingJob(null);
    setShowForm(true);
  }

  function handleEditClick(job: Job) {
    setEditingJob(job);
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (res.ok) {
      setJobs((current) => current.filter((job) => job.id !== id));
      showToast("Job removed");
    } else {
      showToast("Failed to remove job", "error");
    }
  }

  async function confirmDeleteJob() {
    if (!pendingDeleteJob) return;
    await handleDelete(pendingDeleteJob.id);
    setPendingDeleteJob(null);
  }

  async function handleSave(job: Job) {
    const isEdit = jobs.some((j) => j.id === job.id);

    if (isEdit) {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: job.title,
          company: job.company,
          location: job.location,
          stage: job.stage,
          priority: job.priority,
        }),
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.ok) {
        const updated: Job = await res.json();
        setJobs((current) => current.map((j) => (j.id === updated.id ? updated : j)));
        showToast("Job updated");
      } else {
        showToast("Failed to update job", "error");
      }
    } else {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: job.title,
          company: job.company,
          location: job.location,
          stage: job.stage,
          priority: job.priority,
        }),
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.ok) {
        const created: Job = await res.json();
        setJobs((current) => [created, ...current]);
        showToast("Job added");
      } else {
        showToast("Failed to add job", "error");
      }
    }

    setShowForm(false);
    setEditingJob(null);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingJob(null);
  }

  const filtered = jobs
    .filter((job) => {
      if (search) {
        const q = search.toLowerCase();
        return job.title.toLowerCase().includes(q) || job.company.toLowerCase().includes(q);
      }
      return true;
    })
    .filter((job) => {
      if (stageFilter) return job.stage === stageFilter;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "company") return a.company.localeCompare(b.company);
      if (sortBy === "priority") return (b.priority ? 1 : 0) - (a.priority ? 1 : 0);
      return b.lastActivityDate.localeCompare(a.lastActivityDate);
    });

  return (
    <>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-50">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-400">Track and manage your job applications.</p>
        </div>
        <button
          type="button"
          onClick={handleAddClick}
          className="bg-indigo-500 hover:bg-indigo-600 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium"
        >
          Add Job
        </button>
      </div>

      {/* Toolbar: Search, Filter, Sort */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md pl-9 pr-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <Select
          value={stageFilter}
          onChange={(val) => setStageFilter(val as JobStage | "")}
          options={[
            { value: "", label: "All stages" },
            ...STAGES.map((stage) => ({ value: stage, label: stage })),
          ]}
          className="sm:w-36"
        />

        <Select
          value={sortBy}
          onChange={(val) => setSortBy(val as "recent" | "company" | "priority")}
          options={[
            { value: "recent", label: "Most recent" },
            { value: "company", label: "Company A-Z" },
            { value: "priority", label: "Priority first" },
          ]}
          className="sm:w-36"
        />
      </div>

      {/* Job count */}
      {!loading && (
        <p className="mb-4 text-xs text-zinc-500">
          {filtered.length} {filtered.length === 1 ? "job" : "jobs"}
          {stageFilter ? ` in ${stageFilter}` : ""}
          {search ? ` matching "${search}"` : ""}
        </p>
      )}

      {/* Job board */}
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <JobCardList
          jobs={filtered}
          onEdit={handleEditClick}
          onDelete={(id) => {
            const job = jobs.find((j) => j.id === id);
            if (job) setPendingDeleteJob(job);
          }}
        />
      )}

      {/* Add/Edit modal */}
      <AddJobModal
        isOpen={showForm}
        initialValues={editingJob}
        onSubmit={handleSave}
        onClose={handleCancel}
      />

      {/* Delete confirmation */}
      <ConfirmDeleteModal
        open={pendingDeleteJob !== null}
        onClose={() => setPendingDeleteJob(null)}
        onConfirm={confirmDeleteJob}
        itemName={
          pendingDeleteJob ? `${pendingDeleteJob.title} at ${pendingDeleteJob.company}` : undefined
        }
      />
    </>
  );
}
