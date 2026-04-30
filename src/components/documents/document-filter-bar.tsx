"use client";

import { useEffect, useMemo, useState } from "react";
import { Select } from "@/components/ui/select";
import type { DocumentResponse, DocumentStatus, DocumentType } from "@/types/document";
import type { ViewMode } from "@/types/job";

type DocumentFilterBarProps = {
  documents: DocumentResponse[];
  onFilteredChange: (filtered: DocumentResponse[]) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  showArchived: boolean;
  onShowArchivedChange: (val: boolean) => void;
};

type TypeFilter = "" | DocumentType;
type StatusFilter = "" | Exclude<DocumentStatus, "ARCHIVED">;
type SortKey = "recent" | "name" | "oldest";

export default function DocumentFilterBar({
  documents,
  onFilteredChange,
  viewMode,
  onViewModeChange,
  showArchived,
  onShowArchivedChange,
}: DocumentFilterBarProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [sortBy, setSortBy] = useState<SortKey>("recent");

  const filtered = useMemo(() => {
    let result = [...documents];

    if (search) {
      const lower = search.toLowerCase();
      result = result.filter((doc) => doc.name.toLowerCase().includes(lower));
    }

    if (typeFilter) {
      result = result.filter((doc) => doc.type === typeFilter);
    }

    if (statusFilter) {
      result = result.filter((doc) => doc.status === statusFilter);
    }

    result.sort((a, b) => {
      if (sortBy === "recent")
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sortBy === "oldest")
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [documents, search, typeFilter, statusFilter, sortBy]);

  useEffect(() => {
    onFilteredChange(filtered);
  }, [filtered, onFilteredChange]);

  const activeFilters = useMemo(() => {
    const chips: { label: string; clear: () => void }[] = [];
    if (typeFilter) {
      const label =
        typeFilter === "COVER_LETTER"
          ? "Cover Letter"
          : typeFilter.charAt(0) + typeFilter.slice(1).toLowerCase();
      chips.push({ label: `Type: ${label}`, clear: () => setTypeFilter("") });
    }
    if (statusFilter) {
      chips.push({ label: `Status: ${statusFilter}`, clear: () => setStatusFilter("") });
    }
    if (search) chips.push({ label: `Search: ${search}`, clear: () => setSearch("") });
    return chips;
  }, [typeFilter, statusFilter, search]);

  const hasActiveFilters = activeFilters.length > 0;

  function clearAll() {
    setSearch("");
    setTypeFilter("");
    setStatusFilter("");
    setSortBy("recent");
  }

  return (
    <div className="mb-6">
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
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search documents"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md pl-9 pr-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {!showArchived && (
          <>
            <Select
              value={typeFilter}
              onChange={(val) => setTypeFilter(val as TypeFilter)}
              options={[
                { value: "", label: "All types" },
                { value: "RESUME", label: "Resume" },
                { value: "COVER_LETTER", label: "Cover Letter" },
                { value: "OTHER", label: "Other" },
              ]}
              className="sm:w-36"
            />
            <Select
              value={statusFilter}
              onChange={(val) => setStatusFilter(val as StatusFilter)}
              options={[
                { value: "", label: "All statuses" },
                { value: "DRAFT", label: "Draft" },
                { value: "READY", label: "Ready" },
                { value: "UPLOADED", label: "Uploaded" },
              ]}
              className="sm:w-36"
            />
            <Select
              value={sortBy}
              onChange={(val) => setSortBy(val as SortKey)}
              options={[
                { value: "recent", label: "Most recent" },
                { value: "name", label: "Name A-Z" },
                { value: "oldest", label: "Oldest first" },
              ]}
              className="sm:w-36"
            />
          </>
        )}

        <div className="flex-1" />

        {/*archive button*/}
        <button
          type="button"
          onClick={() => onShowArchivedChange(!showArchived)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${showArchived
              ? "bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20"
              : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300"
            }`}
          aria-pressed={showArchived}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="21 8 21 21 3 21 3 8" />
            <rect x="1" y="3" width="22" height="5" />
            <line x1="10" y1="12" x2="14" y2="12" />
          </svg>
          {showArchived ? "Viewing archived" : "Archived"}
        </button>

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

      {!showArchived && hasActiveFilters && (
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

      <p className="mt-3 text-xs text-zinc-500">
        {filtered.length} {filtered.length === 1 ? "document" : "documents"}
        {showArchived ? " archived" : ""}
        {search ? ` matching "${search}"` : ""}
      </p>
    </div>
  );
}
