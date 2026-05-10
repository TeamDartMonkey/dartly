"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import AddJobModal from "@/components/dashboard/add-job-modal";
import type { JobFormPayload } from "@/components/dashboard/job-form";
import FilterBar from "@/components/dashboard/filter-bar";
import JobList from "@/components/dashboard/job-list";
import { MetricsPanel } from "@/components/dashboard/metrics-panel";
import { ConfirmArchiveModal } from "@/components/ui/confirm-archive-modal";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { DashboardSkeleton } from "@/components/ui/skeletons/dashboard-skeleton";
import { showToast } from "@/components/ui/toast";
import { useViewMode } from "@/hooks/use-view-mode";
import type { Job, JobStage } from "@/types/job";
import { STAGE_PRISMA_TO_UI } from "@/constants/job-stages";
import { DEFAULT_PREFERENCES, type UserPreferences } from "@/types/settings";

export default function DashboardPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [defaultStage, setDefaultStage] = useState<JobStage>("Interested");
  const prefsLoaded = useRef(false);
  // Tracks whether the user has manually toggled showArchived since mount.
  // If they have, we don't overwrite their choice when preferences load.
  const userToggledArchived = useRef(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [pendingDeleteJob, setPendingDeleteJob] = useState<Job | null>(null);
  const [pendingArchiveJob, setPendingArchiveJob] = useState<Job | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filtered, setFiltered] = useState<Job[]>([]);
  const onFilteredChange = useCallback((f: Job[]) => setFiltered(f), []);
  const [viewMode, setViewMode] = useViewMode();
  const [metricsKey, setMetricsKey] = useState(0);

  // Load user preferences once on mount and apply showArchived + defaultJobStage.
  // If the user has already toggled showArchived before this resolves, respect
  // their choice and only apply defaultStage.
  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/settings", { signal: ctrl.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((prefs: UserPreferences | null) => {
        if (ctrl.signal.aborted || prefsLoaded.current) return;
        prefsLoaded.current = true;
        const p = prefs ?? DEFAULT_PREFERENCES;
        if (!userToggledArchived.current) {
          setShowArchived(p.showArchived);
        }
        const uiStage = STAGE_PRISMA_TO_UI[p.defaultJobStage] ?? "Interested";
        setDefaultStage(uiStage as JobStage);
      })
      .catch(() => {
        // Silently fall back to defaults — preferences are non-critical.
      });
    return () => ctrl.abort();
  }, []);

  const handleShowArchivedChange = useCallback((show: boolean) => {
    userToggledArchived.current = true;
    setShowArchived(show);
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/jobs", { signal: ctrl.signal })
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
        if (ctrl.signal.aborted) return;
        if (data && Array.isArray(data)) setJobs(data);
      })
      .catch((err) => {
        if (ctrl.signal.aborted || err?.name === "AbortError") return;
        showToast("Failed to load jobs", "error");
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
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
      setMetricsKey((k) => k + 1);
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
      setMetricsKey((k) => k + 1);
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
      setMetricsKey((k) => k + 1);
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
      setMetricsKey((k) => k + 1);
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

  async function handleSave(job: JobFormPayload) {
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
        setMetricsKey((k) => k + 1);
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
        setMetricsKey((k) => k + 1);
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
      <MetricsPanel refreshKey={metricsKey} />

      {/* Filter bar */}
      <FilterBar
        jobs={jobs}
        onFilteredChange={onFilteredChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showArchived={showArchived}
        onShowArchivedChange={handleShowArchivedChange}
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
        defaultStage={defaultStage}
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
          pendingArchiveJob
            ? `${pendingArchiveJob.title} at ${pendingArchiveJob.company}`
            : undefined
        }
      />
    </>
  );
}
