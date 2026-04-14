"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import AddJobModal from "@/components/dashboard/add-job-modal";
import FilterBar from "@/components/dashboard/filter-bar";
import JobList from "@/components/dashboard/job-list";
import { MetricsPanel } from "@/components/dashboard/metrics-panel";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { DashboardSkeleton } from "@/components/ui/skeletons/dashboard-skeleton";
import { showToast } from "@/components/ui/toast";
import { useViewMode } from "@/hooks/use-view-mode";
import type { Job, JobStage } from "@/types/job";
import { searchJobs } from "@/utils/search-jobs";
import { ConfirmArchiveModal } from "@/components/ui/confirm-archive-modal";
import { Select } from "@/components/ui/select";

const STAGES: JobStage[] = ["Interested", "Applied", "Interview", "Offer", "Rejected"];

export default function DashboardPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<Exclude<JobStage, "Archived"> | "">("");
  const [sortBy, setSortBy] = useState<"recent" | "company" | "priority">("recent");
  const [pendingDeleteJob, setPendingDeleteJob] = useState<Job | null>(null);
  const [pendingArchiveJob, setPendingArchiveJob] = useState<Job | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filtered, setFiltered] = useState<Job[]>([]);
  const onFilteredChange = useCallback((f: Job[]) => setFiltered(f), []);
  const [viewMode, setViewMode] = useViewMode();

  useEffect(() => {
    fetch("/api/jobs")
      .then((res) => {
        if (res.status === 401) {
          router.push("/login");
          return null;
        }
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data)) setJobs(data);
      })
      .catch(() => {
        showToast("Failed to load jobs", "error");
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

  async function handleStageChange(id: string, stage: JobStage) {
    const res = await fetch(`/api/jobs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
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
  }

  async function handleArchive(id: string) {
    const res = await fetch(`/api/jobs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: "Archived" }),
    });
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (res.ok) {
      const updated: Job = await res.json();
      setJobs((current) => current.map((j) => (j.id === updated.id ? updated : j)));
      showToast("Job archived");
    } else {
      showToast("Failed to archive job", "error");
    }
  }

  async function confirmArchiveJob() {
    if (!pendingArchiveJob) return;
    setIsArchiving(true);
    try {
      await handleArchive(pendingArchiveJob.id);
      setPendingArchiveJob(null);
    } finally {
      setIsArchiving(false);
    }
  }

  async function handleRestore(id: string) {
    const res = await fetch(`/api/jobs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: "Interested" }),
    });
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (res.ok) {
      const updated: Job = await res.json();
      setJobs((current) => current.map((j) => (j.id === updated.id ? updated : j)));
      showToast("Job restored");
    } else {
      showToast("Failed to restore job", "error");
    }
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
    setIsDeleting(true);
    try {
      await handleDelete(pendingDeleteJob.id);
      setPendingDeleteJob(null);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSave(job: Omit<Job, "id" | "createdAt"> & { id?: string }) {
    const existing = job.id ? jobs.find((j) => j.id === job.id) : undefined;
    const isEdit = !!existing;

    if (isEdit) {
      // Skip the API call (and the success toast) if nothing actually changed.
      const unchanged =
        existing.title === job.title &&
        existing.company === job.company &&
        (existing.location ?? "") === (job.location ?? "") &&
        existing.stage === job.stage &&
        existing.priority === job.priority &&
        (existing.deadline ?? "") === (job.deadline ?? "") &&
        (existing.customNotes ?? "") === (job.customNotes ?? "");
      if (unchanged) {
        setShowForm(false);
        setEditingJob(null);
        return;
      }

      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: job.title,
          company: job.company,
          location: job.location,
          stage: job.stage,
          priority: job.priority,
          deadline: job.deadline,
          customNotes: job.customNotes,
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
          deadline: job.deadline,
          customNotes: job.customNotes,
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

  const displayedJobs = searchJobs(jobs, search)
    .filter((job) => {
      if (showArchived) return job.stage === "Archived";
      if (job.stage === "Archived") return false;
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

      {/* Metrics */}
      <MetricsPanel />

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
          onChange={(val) => setStageFilter(val as Exclude<JobStage, "Archived"> | "")}
          options={[
            { value: "", label: "All stages" },
            ...STAGES.map((stage) => ({ value: stage, label: stage })),
          ]}
          className="sm:w-36"
          disabled={showArchived}
        />

        <button
          type="button"
          onClick={() => {
            setShowArchived((prev) => !prev);
            setStageFilter("");
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium border ${showArchived
            ? "bg-indigo-500 border-indigo-500 text-zinc-50"
            : "bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-50"
            }`}
        >
          Archived
        </button>

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
          {displayedJobs.length} {displayedJobs.length === 1 ? "job" : "jobs"}
          {stageFilter ? ` in ${stageFilter}` : ""}
          {search ? ` matching "${search}"` : ""}
        </p>
      )}
      {/* Filter bar */}
      <FilterBar
        jobs={jobs}
        onFilteredChange={onFilteredChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Job board */}
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <JobList
          jobs={displayedJobs}
          viewMode={viewMode}
          onEdit={handleEditClick}
          onDelete={(id) => {
            const job = jobs.find((j) => j.id === id);
            if (job) setPendingDeleteJob(job);
          }}
          onStageChange={handleStageChange}
          onArchive={(id) => {
            const job = jobs.find((j) => j.id === id);
            if (job) setPendingArchiveJob(job);
          }}
          onRestore={handleRestore}
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
        isSubmitting={isDeleting}
        itemName={
          pendingDeleteJob ? `${pendingDeleteJob.title} at ${pendingDeleteJob.company}` : undefined
        }
      />

      <ConfirmArchiveModal
        open={pendingArchiveJob !== null}
        onClose={() => setPendingArchiveJob(null)}
        onConfirm={confirmArchiveJob}
        isSubmitting={isArchiving}
        itemName={
          pendingArchiveJob ? `${pendingArchiveJob.title} at ${pendingArchiveJob.company}` : undefined
        }
      />
    </>
  );
}
