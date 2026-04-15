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

export default function DashboardPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [filtered, setFiltered] = useState<Job[]>([]);
  const [pendingDeleteJob, setPendingDeleteJob] = useState<Job | null>(null);
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

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-50">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-400">Track and manage your job applications.</p>
      </div>

      {/* Metrics */}
      <MetricsPanel />

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
          jobs={filtered}
          viewMode={viewMode}
          onAdd={handleAddClick}
          onEdit={handleEditClick}
          onDelete={(id) => {
            const job = jobs.find((j) => j.id === id);
            if (job) setPendingDeleteJob(job);
          }}
          onStageChange={handleStageChange}
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
