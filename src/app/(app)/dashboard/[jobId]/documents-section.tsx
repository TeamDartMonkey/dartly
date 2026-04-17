"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { showToast } from "@/components/ui/toast";
import type { DocumentResponse } from "@/types/document";
import type { Job } from "@/types/job";

type DocumentsSectionProps = {
  job: Job;
  onJobUpdated?: (job: Job) => void;
};

const TYPE_STYLES: Record<string, string> = {
  RESUME: "bg-indigo-500/10 text-indigo-400",
  COVER_LETTER: "bg-emerald-500/10 text-emerald-400",
  OTHER: "bg-zinc-700 text-zinc-400",
};

const TYPE_LABELS: Record<string, string> = {
  RESUME: "Resume",
  COVER_LETTER: "Cover Letter",
  OTHER: "Other",
};

export function DocumentsSection({ job }: DocumentsSectionProps) {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch(`/api/jobs/${job.id}/documents`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setDocuments(data);
      }
    } catch {
      showToast("Failed to load documents", "error");
    } finally {
      setLoading(false);
    }
  }, [job.id]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  async function handleGenerate(type: "resume" | "cover-letter") {
    setGenerating(type);
    try {
      const endpoint = type === "resume" ? "/api/ai/resume" : "/api/ai/cover-letter";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id }),
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || "Generation failed", "error");
        return;
      }

      const doc = await res.json();
      showToast(`${type === "resume" ? "Resume" : "Cover letter"} generated`);
      await fetchDocuments();
      router.push(`/documents/${doc.id}`);
    } catch {
      showToast("Generation failed", "error");
    } finally {
      setGenerating(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-400">Documents</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleGenerate("resume")}
            disabled={generating !== null}
            className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-zinc-50 px-3 py-1.5 rounded-md text-sm font-medium"
          >
            {generating === "resume" ? "Generating..." : "Generate Resume"}
          </button>
          <button
            type="button"
            onClick={() => handleGenerate("cover-letter")}
            disabled={generating !== null}
            className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 disabled:opacity-50 text-zinc-50 px-3 py-1.5 rounded-md text-sm font-medium"
          >
            {generating === "cover-letter" ? "Generating..." : "Generate Cover Letter"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-12 bg-zinc-800 animate-pulse rounded-md" />
          <div className="h-12 bg-zinc-800 animate-pulse rounded-md" />
        </div>
      ) : documents.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-700 py-8 text-center">
          <p className="text-sm text-zinc-500">No documents yet</p>
          <p className="text-xs text-zinc-600 mt-1">
            Generate a resume or cover letter for this job
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {documents.map((doc) => (
            <li key={doc.id}>
              <button
                type="button"
                onClick={() => router.push(`/documents/${doc.id}`)}
                className="w-full flex items-center justify-between gap-3 rounded-lg border border-zinc-700 bg-zinc-950/40 p-3 hover:border-zinc-600 transition-colors text-left"
              >
                <div className="min-w-0 flex items-center gap-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_STYLES[doc.type] ?? TYPE_STYLES.OTHER}`}
                  >
                    {TYPE_LABELS[doc.type] ?? "Other"}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-zinc-200 truncate">{doc.name}</p>
                    <p className="text-xs text-zinc-500">
                      v{doc.versionNumber} &middot;{" "}
                      {new Date(doc.updatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-zinc-500"
                  aria-hidden="true"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
