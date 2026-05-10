"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { showToast } from "@/components/ui/toast";

type JobPickerModalProps = {
  open: boolean;
  mode: "resume" | "cover-letter";
  onClose: () => void;
  onGenerated: (documentId: string) => void;
};

type JobOption = {
  id: string;
  title: string;
  company: string;
};

export function JobPickerModal({ open, mode, onClose, onGenerated }: JobPickerModalProps) {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    setSearch("");
    setSelectedId(null);

    const ctrl = new AbortController();
    fetch("/api/jobs", { signal: ctrl.signal })
      .then((res) => {
        if (res.status === 401) {
          router.push("/login");
          return null;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (ctrl.signal.aborted) return;
        if (data && Array.isArray(data)) {
          setJobs(
            data.map((j: { id: string; title: string; company: string }) => ({
              id: j.id,
              title: j.title,
              company: j.company,
            }))
          );
        }
      })
      .catch((err) => {
        if (ctrl.signal.aborted || err?.name === "AbortError") return;
        setError("Failed to load jobs");
        showToast("Failed to load jobs", "error");
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, [open, router]);

  const filtered = search
    ? jobs.filter((j) => {
        const q = search.toLowerCase();
        return j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q);
      })
    : jobs;

  async function handleGenerate() {
    if (!selectedId) return;
    setGenerating(true);
    setError(null);

    const endpoint = mode === "resume" ? "/api/ai/resume" : "/api/ai/cover-letter";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: selectedId }),
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to generate document");
        return;
      }

      const doc = await res.json();
      onGenerated(doc.id);
    } catch {
      setError("Something went wrong");
    } finally {
      setGenerating(false);
    }
  }

  const modeLabel = mode === "resume" ? "Resume" : "Cover Letter";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Generate ${modeLabel} — Select a Job`}
      maxWidth="md"
    >
      <div className="space-y-4">
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

        <div className="max-h-64 overflow-y-auto space-y-1">
          {loading && <p className="text-sm text-zinc-500 text-center py-4">Loading jobs...</p>}
          {!loading && filtered.length === 0 && (
            <p className="text-sm text-zinc-500 text-center py-4">No jobs found.</p>
          )}
          {filtered.map((job) => (
            <button
              key={job.id}
              type="button"
              onClick={() => setSelectedId(job.id)}
              disabled={generating}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                selectedId === job.id
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30"
                  : "text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              <span className="font-medium">{job.title}</span>
              <span className="text-zinc-500"> at {job.company}</span>
            </button>
          ))}
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={generating}
            className="flex-1 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-200 px-4 py-2.5 rounded-md text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!selectedId || generating}
            className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-zinc-50 px-4 py-2.5 rounded-md text-sm font-medium transition-colors"
          >
            {generating ? "Generating..." : `Generate ${modeLabel}`}
          </button>
        </div>
      </div>
    </Modal>
  );
}
