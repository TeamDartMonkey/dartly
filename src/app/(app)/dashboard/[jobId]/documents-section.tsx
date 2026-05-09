"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [libraryDocuments, setLibraryDocuments] = useState<DocumentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);
  const [showLinkMenu, setShowLinkMenu] = useState(false);

  const linkedVersionIds = useMemo(() => {
    return new Set(
      documents.map((doc) => doc.documentVersionId).filter((id): id is string => Boolean(id))
    );
  }, [documents]);

  const availableDocuments = useMemo(() => {
    return libraryDocuments.filter((doc) => {
      return doc.documentVersionId && !linkedVersionIds.has(doc.documentVersionId);
    });
  }, [libraryDocuments, linkedVersionIds]);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetch(`/api/jobs/${job.id}/documents`);

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        showToast("Failed to load documents", "error");
        return;
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setDocuments(data);
      }
    } catch {
      showToast("Failed to load documents", "error");
    } finally {
      setLoading(false);
    }
  }, [job.id, router]);

  const fetchLibraryDocuments = useCallback(async () => {
    setLibraryLoading(true);

    try {
      const res = await fetch("/api/documents");

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        showToast("Failed to load library documents", "error");
        return;
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setLibraryDocuments(data);
      }
    } catch {
      showToast("Failed to load library documents", "error");
    } finally {
      setLibraryLoading(false);
    }
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // We can't pass an AbortSignal through fetchDocuments without changing
      // its signature in many call sites; gate setState on a cancelled flag
      // so an in-flight fetch on unmount cannot overwrite a newer page mount.
      await fetchDocuments();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchDocuments]);

  async function handleOpenLinkMenu() {
    setShowLinkMenu((current) => !current);

    if (libraryDocuments.length === 0) {
      await fetchLibraryDocuments();
    }
  }

  async function handleLinkDocument(doc: DocumentResponse) {
    if (!doc.documentVersionId) {
      showToast("Missing document version id", "error");
      return;
    }

    setLinking(true);

    try {
      const res = await fetch(`/api/jobs/${job.id}/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId: doc.id,
          documentVersionId: doc.documentVersionId,
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        showToast(data?.error || "Failed to link document", "error");
        return;
      }

      showToast("Document linked");
      setShowLinkMenu(false);
      await fetchDocuments();
      await fetchLibraryDocuments();
    } catch {
      showToast("Failed to link document", "error");
    } finally {
      setLinking(false);
    }
  }

  async function handleUnlinkDocument(doc: DocumentResponse) {
    if (!doc.documentVersionId) {
      showToast("Missing document version id", "error");
      return;
    }

    setUnlinkingId(doc.documentVersionId);

    try {
      const res = await fetch(`/api/jobs/${job.id}/documents/${doc.documentVersionId}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => null);

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        showToast(data?.error || "Failed to unlink document", "error");
        return;
      }

      showToast("Document unlinked");
      await fetchDocuments();
      await fetchLibraryDocuments();
    } catch {
      showToast("Failed to unlink document", "error");
    } finally {
      setUnlinkingId(null);
    }
  }

  async function handleGenerate(type: "resume" | "cover-letter") {
    setGenerating(type);

    try {
      const endpoint = type === "resume" ? "/api/ai/resume" : "/api/ai/cover-letter";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId: job.id }),
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        showToast(data?.error || "Generation failed", "error");
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
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-zinc-400">Documents</h3>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleOpenLinkMenu}
            disabled={linking}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm font-medium text-zinc-50 hover:bg-zinc-800 disabled:opacity-50"
          >
            + Link Document
          </button>

          <button
            type="button"
            onClick={() => handleGenerate("resume")}
            disabled={generating !== null}
            className="rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-medium text-zinc-50 hover:bg-indigo-600 disabled:opacity-50"
          >
            {generating === "resume" ? "Generating..." : "Generate Resume"}
          </button>

          <button
            type="button"
            onClick={() => handleGenerate("cover-letter")}
            disabled={generating !== null}
            className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-50 hover:bg-zinc-700 disabled:opacity-50"
          >
            {generating === "cover-letter" ? "Generating..." : "Generate Cover Letter"}
          </button>
        </div>
      </div>

      {showLinkMenu && (
        <div className="rounded-lg border border-zinc-700 bg-zinc-950/60 p-3">
          <p className="mb-2 text-sm font-medium text-zinc-300">
            Select a library document to link
          </p>

          {libraryLoading ? (
            <p className="text-sm text-zinc-500">Loading library documents...</p>
          ) : availableDocuments.length === 0 ? (
            <p className="text-sm text-zinc-500">No available library documents to link.</p>
          ) : (
            <ul className="space-y-2">
              {availableDocuments.map((doc) => (
                <li key={doc.documentVersionId ?? doc.id}>
                  <button
                    type="button"
                    onClick={() => handleLinkDocument(doc)}
                    disabled={linking}
                    className="flex w-full items-center justify-between gap-3 rounded-md border border-zinc-800 bg-zinc-900 p-3 text-left hover:border-zinc-600 disabled:opacity-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-zinc-200">{doc.name}</p>
                      <p className="text-xs text-zinc-500">{TYPE_LABELS[doc.type] ?? "Other"}</p>
                    </div>

                    <span className="text-xs font-medium text-indigo-400">Link</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          <div className="h-12 animate-pulse rounded-md bg-zinc-800" />
          <div className="h-12 animate-pulse rounded-md bg-zinc-800" />
        </div>
      ) : documents.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-700 py-8 text-center">
          <p className="text-sm text-zinc-500">No linked documents yet</p>
          <p className="mt-1 text-xs text-zinc-600">
            Link a library document or generate a resume or cover letter for this job.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {documents.map((doc) => {
            return (
              <li
                key={doc.documentVersionId ?? doc.id}
                className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-950/40 p-3"
              >
                <button
                  type="button"
                  onClick={() => router.push(`/documents/${doc.id}`)}
                  className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        TYPE_STYLES[doc.type] ?? TYPE_STYLES.OTHER
                      }`}
                    >
                      {TYPE_LABELS[doc.type] ?? "Other"}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-sm text-zinc-200">{doc.name}</p>
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

                <button
                  type="button"
                  onClick={() => handleUnlinkDocument(doc)}
                  disabled={unlinkingId === doc.documentVersionId}
                  className="rounded-md border border-red-500/30 px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                >
                  {unlinkingId === doc.documentVersionId ? "Unlinking..." : "Unlink"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
