"use client";

import { defaultSchema } from "hast-util-sanitize";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { RewritePanel } from "@/components/documents/rewrite-panel";

// Resume content (Jake's-Resume format) embeds inline span/div/br with `class`
// attributes for layout. We extend the default sanitize schema narrowly:
// `class` is permitted only on span and div (not globally), and only on the
// added tags. Script/iframe/on*/etc. remain blocked by defaultSchema.
const RESUME_SANITIZE_SCHEMA = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    span: [...(defaultSchema.attributes?.span ?? []), "className", "class"],
    div: [...(defaultSchema.attributes?.div ?? []), "className", "class"],
  },
  // br is already in defaultSchema.tagNames; we add span/div which are not.
  tagNames: Array.from(new Set([...(defaultSchema.tagNames ?? []), "span", "div"])),
};
import { ConfirmArchiveModal } from "@/components/ui/confirm-archive-modal";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { Select } from "@/components/ui/select";
import { showToast } from "@/components/ui/toast";
import "@/styles/jakes-resume.css";
import type { DocumentResponse, DocumentVersionResponse } from "@/types/document";
import { DownloadButton } from "@/components/documents/download-button";
import dynamic from "next/dynamic";

const PdfViewer = dynamic(
  () => import("@/components/documents/pdf-viewer").then((m) => m.PdfViewer),
  { ssr: false }
);

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

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-yellow-500/10 text-yellow-400",
  READY: "bg-green-500/10 text-green-400",
  ARCHIVED: "bg-zinc-700 text-zinc-400",
  UPLOADED: "bg-blue-500/10 text-blue-400",
};

type ViewMode = "preview" | "markdown" | "edit";

const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: "preview", label: "Preview" },
  { value: "markdown", label: "Markdown" },
  { value: "edit", label: "Edit" },
];

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [doc, setDoc] = useState<DocumentResponse | null>(null);
  const [versions, setVersions] = useState<DocumentVersionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const [editContent, setEditContent] = useState("");
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingArchive, setPendingArchive] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loadingSignedUrl, setLoadingSignedUrl] = useState(false);

  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    params.then((p) => {
      if (!cancelled) setId(p.id);
    });
    return () => {
      cancelled = true;
    };
  }, [params]);

  useEffect(() => {
    if (!id) return;
    const ctrl = new AbortController();

    async function loadData() {
      try {
        const [docRes, verRes] = await Promise.all([
          fetch(`/api/documents/${id}`, { signal: ctrl.signal }),
          fetch(`/api/documents/${id}/versions`, { signal: ctrl.signal }),
        ]);

        if (ctrl.signal.aborted) return;

        if (docRes.status === 401) {
          router.push("/login");
          return;
        }

        if (docRes.status === 404) {
          showToast("Document not found", "error");
          router.push("/documents");
          return;
        }

        if (!docRes.ok) throw new Error(`HTTP ${docRes.status}`);

        const docData = await docRes.json();
        if (ctrl.signal.aborted) return;
        setDoc(docData);
        setEditContent(docData.content ?? "");
        setRenameValue(docData.name);

        if (verRes.ok) {
          const verData = await verRes.json();
          if (!ctrl.signal.aborted && Array.isArray(verData)) {
            setVersions(verData);
            if (verData.length > 0) {
              setSelectedVersionId(verData[0].id);
            }
          }
        }

        //for uploaded docs
        if (docData.status === "UPLOADED" || docData.status === "ARCHIVED") {
          setLoadingSignedUrl(true);
          try {
            const urlRes = await fetch(`/api/documents/${id}/signed-url`, {
              signal: ctrl.signal,
            });
            if (ctrl.signal.aborted) return;
            if (urlRes.ok) {
              const { url } = await urlRes.json();
              if (!ctrl.signal.aborted) setSignedUrl(url);
            } else {
              showToast("Failed to load file preview", "error");
            }
          } finally {
            if (!ctrl.signal.aborted) setLoadingSignedUrl(false);
          }
        }
      } catch (err) {
        if (ctrl.signal.aborted || (err as Error)?.name === "AbortError") return;
        showToast("Failed to load document", "error");
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }

    loadData();
    return () => ctrl.abort();
  }, [id, router]);

  async function handleSave() {
    if (!doc) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/documents/${doc.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.ok) {
        const updated = await res.json();
        setDoc(updated);
        setViewMode("preview");
        showToast("Document saved");
        const verRes = await fetch(`/api/documents/${doc.id}/versions`);
        if (verRes.ok) {
          const verData = await verRes.json();
          if (Array.isArray(verData)) {
            setVersions(verData);
            if (verData.length > 0) setSelectedVersionId(verData[0].id);
          }
        }
      } else {
        showToast("Failed to save document", "error");
      }
    } catch {
      showToast("Failed to save document", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleRestore() {
    if (!doc) return;
    const version = versions.find((v) => v.id === selectedVersionId);
    if (!version) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/documents/${doc.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: version.content ?? "" }),
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.ok) {
        const updated = await res.json();
        setDoc(updated);
        showToast("Version restored");
        const verRes = await fetch(`/api/documents/${doc.id}/versions`);
        if (verRes.ok) {
          const verData = await verRes.json();
          if (Array.isArray(verData)) {
            setVersions(verData);
            if (verData.length > 0) setSelectedVersionId(verData[0].id);
          }
        }
      } else {
        showToast("Failed to restore version", "error");
      }
    } catch {
      showToast("Failed to restore version", "error");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!doc) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/documents/${doc.id}`, { method: "DELETE" });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.ok) {
        showToast("Document removed");
        router.push("/documents");
      } else {
        showToast("Failed to remove document", "error");
      }
    } finally {
      setIsDeleting(false);
      setPendingDelete(false);
    }
  }

  async function confirmArchive() {
    if (!doc) return;
    const res = await fetch(`/api/documents/${doc.id}/archive`, { method: "PATCH" });
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (res.ok) {
      const updated = await res.json();
      setDoc(updated);
      showToast("Document archived");
    } else {
      showToast("Failed to archive document", "error");
    }
    setPendingArchive(false);
  }

  async function handleRestoreArchived() {
    if (!doc) return;
    const res = await fetch(`/api/documents/${doc.id}/restore`, { method: "PATCH" });
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (res.ok) {
      const updated = await res.json();
      setDoc(updated);
      showToast("Document restored");
    } else {
      showToast("Failed to restore document", "error");
    }
  }

  async function handleDuplicate() {
    if (!doc) return;
    const res = await fetch(`/api/documents/${doc.id}/duplicate`, { method: "POST" });
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (res.ok) {
      const newDoc = await res.json();
      showToast("Document duplicated");
      router.push(`/documents/${newDoc.id}`);
    } else {
      showToast("Failed to duplicate document", "error");
    }
  }

  function startRename() {
    setRenameValue(doc?.name ?? "");
    setRenaming(true);
    setTimeout(() => renameInputRef.current?.select(), 0);
  }

  async function commitRename() {
    setRenaming(false);
    const trimmed = renameValue.trim();
    if (!doc || !trimmed || trimmed === doc.name) return;
    const res = await fetch(`/api/documents/${doc.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (res.ok) {
      const updated = await res.json();
      setDoc(updated);
      showToast("Document renamed");
    } else {
      showToast("Failed to rename document", "error");
    }
  }

  function handleRenameKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") commitRename();
    if (e.key === "Escape") setRenaming(false);
  }

  function refreshDoc() {
    if (!id) return;
    fetch(`/api/documents/${id}`)
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data) {
          setDoc(data);
          setEditContent(data.content ?? "");
        }
      });
    fetch(`/api/documents/${id}/versions`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setVersions(data);
          if (data.length > 0) setSelectedVersionId(data[0].id);
        }
      });
  }

  function handleViewModeChange(mode: ViewMode) {
    if (mode === "edit") {
      setEditContent(displayContent);
    }
    setViewMode(mode);
  }

  const isViewingOldVersion = doc && versions.length > 0 && selectedVersionId !== versions[0]?.id;
  const displayContent = (() => {
    const v = versions.find((ver) => ver.id === selectedVersionId);
    if (v) return v.content ?? "";
    return doc?.content ?? "";
  })();

  const isUploaded = doc?.status === "UPLOADED" || (doc?.status === "ARCHIVED" && signedUrl);
  const isArchived = doc?.status === "ARCHIVED";

  if (loading || !doc) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-32 bg-zinc-800 animate-pulse rounded-md" />
        <div className="h-8 w-64 bg-zinc-800 animate-pulse rounded-md" />
        <div className="h-96 bg-zinc-800 animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center justify-center w-10 h-10 rounded-md text-indigo-400 hover:text-indigo-300 hover:bg-zinc-800 text-lg transition-colors"
          aria-label="Go back"
        >
          &larr;
        </button>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              {renaming ? (
                <input
                  ref={renameInputRef}
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={handleRenameKeyDown}
                  className="bg-zinc-800 border border-indigo-500 rounded-md px-2 py-1 text-2xl font-semibold text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full max-w-md"
                />
              ) : (
                <h1 className="text-2xl font-semibold text-zinc-50 truncate">{doc.name}</h1>
              )}
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${TYPE_STYLES[doc.type] ?? TYPE_STYLES.OTHER}`}
              >
                {TYPE_LABELS[doc.type] ?? "Other"}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${STATUS_STYLES[doc.status] ?? STATUS_STYLES.DRAFT}`}
              >
                {doc.status}
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              v{doc.versionNumber} &middot; Created {new Date(doc.createdAt).toLocaleDateString()}{" "}
              &middot; Updated {new Date(doc.updatedAt).toLocaleDateString()}
            </p>
          </div>

          {/* Header action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {!isArchived && (
              <>
                <button
                  type="button"
                  onClick={startRename}
                  className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors"
                  aria-label="Rename"
                  title="Rename"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleDuplicate}
                  className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors"
                  aria-label="Duplicate"
                  title="Duplicate"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
              </>
            )}
            <DownloadButton doc={doc} signedUrl={signedUrl} />
          </div>
        </div>

        {!isUploaded && versions.length > 0 && (
          <div className="flex items-center gap-3">
            <Select
              value={selectedVersionId ?? ""}
              onChange={(val) => {
                setSelectedVersionId(val);
                if (viewMode === "edit") setViewMode("preview");
              }}
              options={versions.map((v) => ({
                value: v.id,
                label: `v${v.versionNumber} — ${new Date(v.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}`,
              }))}
              className="w-72"
            />
            {isViewingOldVersion && (
              <button
                type="button"
                onClick={handleRestore}
                disabled={saving}
                className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {saving ? "Restoring..." : "Restore this version"}
              </button>
            )}
          </div>
        )}

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          {isUploaded ? (
            <div className="w-full">
              {loadingSignedUrl ? (
                <div className="h-[700px] bg-zinc-800 animate-pulse rounded-md" />
              ) : signedUrl ? (
                <PdfViewer url={signedUrl} />
              ) : (
                <div className="h-[700px] flex items-center justify-center text-zinc-500 text-sm">
                  Failed to load preview.
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {VIEW_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleViewModeChange(opt.value)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                        viewMode === opt.value
                          ? "bg-indigo-500 text-zinc-50"
                          : "bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {viewMode === "edit" ? (
                <div className="space-y-4">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm w-full min-h-100 text-zinc-50 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("preview")}
                      disabled={saving}
                      className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : viewMode === "preview" ? (
                <div className="bg-zinc-950 rounded-md p-4 overflow-auto">
                  {displayContent ? (
                    <div
                      className={`jakes-resume-preview${doc.type === "COVER_LETTER" ? " cover-letter-preview" : ""}`}
                    >
                      <Markdown rehypePlugins={[rehypeRaw, [rehypeSanitize, RESUME_SANITIZE_SCHEMA]]}>
                        {displayContent}
                      </Markdown>
                    </div>
                  ) : (
                    <span className="text-zinc-500 italic">No content</span>
                  )}
                </div>
              ) : (
                <div className="bg-zinc-950 rounded-md p-4 overflow-auto">
                  {displayContent ? (
                    <div className="markdown-viewer max-w-3xl mx-auto">
                      <Markdown rehypePlugins={[rehypeRaw, [rehypeSanitize, RESUME_SANITIZE_SCHEMA]]}>
                        {displayContent}
                      </Markdown>
                    </div>
                  ) : (
                    <span className="text-zinc-500 italic">No content</span>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {!isUploaded && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-sm font-medium text-zinc-400 mb-4">AI Rewrite</h2>
            <RewritePanel documentId={doc.id} onAccept={refreshDoc} />
          </div>
        )}

        {/* Danger zone */}
        <div className="pt-4 border-t border-zinc-800 flex items-center gap-6">
          {isArchived ? (
            <button
              type="button"
              onClick={handleRestoreArchived}
              className="text-sm text-green-400 hover:text-green-300 font-medium"
            >
              Restore this document
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setPendingArchive(true)}
              className="text-sm text-orange-400 hover:text-orange-300 font-medium"
            >
              Archive this document
            </button>
          )}
          <button
            type="button"
            onClick={() => setPendingDelete(true)}
            className="text-sm text-red-400 hover:text-red-300 font-medium"
          >
            Delete this document
          </button>
        </div>
      </div>

      <ConfirmArchiveModal
        open={pendingArchive}
        onClose={() => setPendingArchive(false)}
        onConfirm={confirmArchive}
        itemName={doc.name}
      />
      <ConfirmDeleteModal
        open={pendingDelete}
        onClose={() => setPendingDelete(false)}
        onConfirm={confirmDelete}
        isSubmitting={isDeleting}
        itemName={doc.name}
      />
    </>
  );
}
