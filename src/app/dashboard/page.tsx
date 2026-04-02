"use client";

import { useState } from "react";
import AddJobModal from "@/components/dashboard/add_job_modal";
import JobCardList from "@/components/dashboard/job_card_list";
import type { Job, JobStage } from "@/types/job";

const STAGES: JobStage[] = ["Interested", "Applied", "Interview", "Offer", "Rejected", "Archived"];

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<JobStage | "">("");
  const [sortBy, setSortBy] = useState<"recent" | "company" | "priority">("recent");

  function handleAddClick() {
    setEditingJob(null);
    setShowForm(true);
  }

  function handleEditClick(job: Job) {
    setEditingJob(job);
    setShowForm(true);
  }

  function handleDelete(id: string) {
    setJobs((current) => current.filter((job) => job.id !== id));
  }

  function handleSave(job: Job) {
    setJobs((current) => {
      const exists = current.some((j) => j.id === job.id);
      if (exists) {
        return current.map((j) => (j.id === job.id ? job : j));
      }
      return [job, ...current];
    });
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
        return (
          job.title.toLowerCase().includes(q) ||
          job.company.toLowerCase().includes(q)
        );
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
          <p className="mt-1 text-sm text-zinc-400">
            Track and manage your job applications.
          </p>
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
        {/* Search */}
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

        {/* Stage filter */}
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value as JobStage | "")}
          className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">All stages</option>
          {STAGES.map((stage) => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "recent" | "company" | "priority")}
          className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="recent">Most recent</option>
          <option value="company">Company A-Z</option>
          <option value="priority">Priority first</option>
        </select>
      </div>

      {/* Job count */}
      <p className="mb-4 text-xs text-zinc-500">
        {filtered.length} {filtered.length === 1 ? "job" : "jobs"}
        {stageFilter ? ` in ${stageFilter}` : ""}
        {search ? ` matching "${search}"` : ""}
      </p>

      {/* Job board */}
      <JobCardList jobs={filtered} onEdit={handleEditClick} onDelete={handleDelete} />

      {/* Add/Edit modal */}
      <AddJobModal
        isOpen={showForm}
        initialValues={editingJob}
        onSubmit={handleSave}
        onClose={handleCancel}
      />
    </>
  );
}
