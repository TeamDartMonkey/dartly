"use client";

import { useEffect, useMemo, useState } from "react";
import { Select } from "@/components/ui/select";
import { DEADLINE_STATE_OPTIONS, getDeadlineState } from "@/constants/job-filters";
import { STAGES } from "@/constants/job-stages";
import type { Job, JobStage, ViewMode } from "@/types/job";
import { searchJobs } from "@/utils/search-jobs";
import type { SortKey } from "@/utils/sort-jobs";
import { sortJobs } from "@/utils/sort-jobs";

type FilterBarProps = {
  jobs: Job[];
  onFilteredChange: (filtered: Job[]) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  showArchived: boolean;
  onShowArchivedChange: (show: boolean) => void;
};

export default function FilterBar({
  jobs,
  onFilteredChange,
  viewMode,
  onViewModeChange,
  showArchived,
  onShowArchivedChange,
}: FilterBarProps) {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<JobStage | "">("");
  const [locationFilter, setLocationFilter] = useState("");
  const [deadlineFilter, setDeadlineFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("recent");

  const locationOptions = useMemo(() => {
    const unique = [...new Set(jobs.map((j) => j.location).filter(Boolean))] as string[];
    unique.sort();
    return [
      { value: "", label: "All locations" },
      ...unique.map((loc) => ({ value: loc, label: loc })),
      { value: "__none__", label: "No location" },
    ];
  }, [jobs]);

  const filtered = useMemo(() => {
    let result = showArchived
      ? jobs.filter((j) => j.stage === "Archived")
      : jobs.filter((j) => j.stage !== "Archived");

    result = searchJobs(result, search);

    if (stageFilter && !showArchived) {
      result = result.filter((job) => job.stage === stageFilter);
    }

    if (locationFilter) {
      if (locationFilter === "__none__") {
        result = result.filter((job) => !job.location);
      } else {
        result = result.filter((job) => job.location === locationFilter);
      }
    }

    if (deadlineFilter) {
      result = result.filter((job) => {
        const state = getDeadlineState(job.deadline);
        if (deadlineFilter === "none") return state === "none-set";
        return state === deadlineFilter;
      });
    }

    result = sortJobs(result, sortBy);

    return result;
  }, [jobs, search, stageFilter, locationFilter, deadlineFilter, sortBy, showArchived]);

  useEffect(() => {
    onFilteredChange(filtered);
  }, [filtered, onFilteredChange]);

  const activeFilters = useMemo(() => {
    const chips: { label: string; clear: () => void }[] = [];
    if (stageFilter)
      chips.push({ label: `Stage: ${stageFilter}`, clear: () => setStageFilter("") });
    if (locationFilter)
      chips.push({
        label: locationFilter === "__none__" ? "Location: None" : `Location: ${locationFilter}`,
        clear: () => setLocationFilter(""),
      });
    if (deadlineFilter)
      chips.push({
        label: `Deadline: ${DEADLINE_STATE_OPTIONS.find((o) => o.value === deadlineFilter)?.label}`,
        clear: () => setDeadlineFilter(""),
      });
    if (search) chips.push({ label: `Search: ${search}`, clear: () => setSearch("") });
    return chips;
  }, [stageFilter, locationFilter, deadlineFilter, search]);

  const hasActiveFilters = activeFilters.length > 0;

  function clearAll() {
    setSearch("");
    setStageFilter("");
    setLocationFilter("");
    setDeadlineFilter("");
    setSortBy("recent");
  }

  return (
    <div className="mb-6">
      {/* Row 1: Search */}
      <div className="mb-3">
        <div className="relative">
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
            aria-label="Search jobs"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md pl-9 pr-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Row 2: Filters + Sort + View toggle */}
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={stageFilter}
          onChange={(val) => setStageFilter(val as JobStage | "")}
          options={[
            { value: "", label: "All stages" },
            ...STAGES.filter((s) => s !== "Archived").map((s) => ({
              value: s,
              label: s,
            }))
          ]}
          className="sm:w-36"
          disabled={showArchived}
        />

        <Select
          value={locationFilter}
          onChange={setLocationFilter}
          options={locationOptions}
          className="sm:w-40"
        />

        <Select
          value={deadlineFilter}
          onChange={setDeadlineFilter}
          options={[...DEADLINE_STATE_OPTIONS]}
          className="sm:w-40"
        />

        <Select
          value={sortBy}
          onChange={(val) => setSortBy(val as SortKey)}
          options={[
            { value: "recent", label: "Most recent" },
            { value: "deadline", label: "Deadline (soonest)" },
            { value: "created", label: "Date created" },
            { value: "company", label: "Company A-Z" },
            { value: "priority", label: "Priority first" },
          ]}
          className="sm:w-36"
        />

        <button
          type="button"
          onClick={() => {
            onShowArchivedChange(!showArchived);
            setStageFilter("");
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium border ${showArchived
            ? "bg-indigo-500 border-indigo-500 text-zinc-50"
            : "bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-50"
            }`}
        >
          Archived
        </button>

        {/* Spacer pushes toggle right */}
        <div className="flex-1" />

        {/* View toggle */}
        {/* biome-ignore lint/a11y/useSemanticElements: visual toggle in flex toolbar, fieldset breaks layout */}
        <div
          className="flex rounded-md border border-zinc-700 overflow-hidden"
          role="group"
          aria-label="View mode"
        >
          <button
            type="button"
            aria-pressed={viewMode === "card"}
            aria-label="Card view"
            onClick={() => onViewModeChange("card")}
            className={`p-1.5 ${viewMode === "card" ? "bg-zinc-700 text-zinc-50" : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"}`}
          >
            <svg
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
              <title>Card view</title>
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </button>
          <button
            type="button"
            aria-pressed={viewMode === "list"}
            aria-label="List view"
            onClick={() => onViewModeChange("list")}
            className={`p-1.5 ${viewMode === "list" ? "bg-zinc-700 text-zinc-50" : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"}`}
          >
            <svg
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
              <title>List view</title>
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {activeFilters.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={chip.clear}
              className="inline-flex items-center gap-1 rounded-md bg-zinc-800 border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              {chip.label}
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Job count */}
      <p className="mt-3 text-xs text-zinc-500">
        {filtered.length} {filtered.length === 1 ? "job" : "jobs"}
        {stageFilter ? ` in ${stageFilter}` : ""}
        {showArchived ? " in Archived" : ""}
        {search ? ` matching "${search}"` : ""}
      </p>
    </div>
  );
}
