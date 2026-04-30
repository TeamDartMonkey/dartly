"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useMemo } from "react";
import DocumentFilterBar from "@/components/documents/document-filter-bar";
import DocumentList from "@/components/documents/document-list";
import { GenerateDocumentDropdown } from "@/components/documents/generate-document-dropdown";
import { UploadDocumentDropdown } from "@/components/documents/upload-document-dropdown";
import { JobPickerModal } from "@/components/documents/job-picker-modal";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { DocumentsSkeleton } from "@/components/ui/skeletons/documents-skeleton";
import { showToast } from "@/components/ui/toast";
import { useDocumentViewMode } from "@/hooks/use-document-view-mode";
import type { DocumentResponse } from "@/types/document";

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtered, setFiltered] = useState<DocumentResponse[]>([]);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<"resume" | "cover-letter">("resume");
  const [viewMode, setViewMode] = useDocumentViewMode();
  const [showArchived, setShowArchived] = useState(false);
  const onFilteredChange = useCallback((f: DocumentResponse[]) => setFiltered(f), []);

  const visibleDocuments = useMemo(() => {
    return showArchived
      ? documents.filter((d) => d.status === "ARCHIVED")
      : documents.filter((d) => d.status !== "ARCHIVED");
  }, [documents, showArchived]);

  useEffect(() => {
    fetch("/api/documents")
      .then((res) => {
        if (res.status === 401) {
          router.push("/login");
          return null;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data)) setDocuments(data);
      })
      .catch(() => {
        showToast("Failed to load documents", "error");
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function confirmDelete() {
    if (!pendingDeleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/documents/${pendingDeleteId}`, { method: "DELETE" });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.ok) {
        setDocuments((current) => current.filter((d) => d.id !== pendingDeleteId));
        showToast("Document removed");
      } else {
        showToast("Failed to remove document", "error");
      }
    } finally {
      setIsDeleting(false);
      setPendingDeleteId(null);
    }
  }

  async function handleDuplicate(id: string) {
    const res = await fetch(`/api/documents/${id}/duplicate`, { method: "POST" });
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (res.ok) {
      const newDoc: DocumentResponse = await res.json();
      setDocuments((prev) => [newDoc, ...prev]);
      showToast("Document duplicated");
    } else {
      showToast("Failed to duplicate document", "error");
    }
  }

  async function handleRename(id: string, newName: string) {
    const res = await fetch(`/api/documents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (res.ok) {
      const updated: DocumentResponse = await res.json();
      setDocuments((prev) => prev.map((d) => (d.id === id ? updated : d)));
      showToast("Document renamed");
    } else {
      showToast("Failed to rename document", "error");
    }
  }

  async function handleArchive(id: string) {
    const res = await fetch(`/api/documents/${id}/archive`, { method: "PATCH" });
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (res.ok) {
      const updated: DocumentResponse = await res.json();
      setDocuments((prev) => prev.map((d) => (d.id === id ? updated : d)));
      showToast("Document archived");
    } else {
      showToast("Failed to archive document", "error");
    }
  }

  async function handleRestore(id: string) {
    const res = await fetch(`/api/documents/${id}/restore`, { method: "PATCH" });
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (res.ok) {
      const updated: DocumentResponse = await res.json();
      setDocuments((prev) => prev.map((d) => (d.id === id ? updated : d)));
      showToast("Document restored");
    } else {
      showToast("Failed to restore document", "error");
    }
  }

  function handleGenerateClick() {
    setPickerMode("resume");
    setPickerOpen(true);
  }

  function handlePickMode(mode: "resume" | "cover-letter") {
    setPickerMode(mode);
    setPickerOpen(true);
  }

  function handleGenerated(documentId: string) {
    setPickerOpen(false);
    router.push(`/documents/${documentId}`);
  }

  function handleUploaded(document: DocumentResponse) {
    setDocuments((current) => [document, ...current]);
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-50">Document Library</h1>
          <p className="mt-1 text-sm text-zinc-400">Your resumes and cover letters.</p>
        </div>
        <div className="flex items-center gap-2">
          <UploadDocumentDropdown onUploaded={handleUploaded} />
          <GenerateDocumentDropdown onPickMode={handlePickMode} />
        </div>
      </div>

      {loading ? (
        <DocumentsSkeleton />
      ) : (
        <>
          <DocumentFilterBar
            documents={visibleDocuments}
            onFilteredChange={onFilteredChange}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            showArchived={showArchived}
            onShowArchivedChange={setShowArchived}
          />
          <DocumentList
            documents={filtered}
            viewMode={viewMode}
            showArchived={showArchived}
            onClick={(id) => router.push(`/documents/${id}`)}
            onDelete={(id) => setPendingDeleteId(id)}
            onDuplicate={handleDuplicate}
            onRename={handleRename}
            onArchive={handleArchive}
            onRestore={handleRestore}
            onGenerate={handleGenerateClick}
          />
        </>
      )}

      <ConfirmDeleteModal
        open={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={confirmDelete}
        isSubmitting={isDeleting}
        itemName={
          pendingDeleteId ? documents.find((d) => d.id === pendingDeleteId)?.name : undefined
        }
      />

      <JobPickerModal
        open={pickerOpen}
        mode={pickerMode}
        onClose={() => setPickerOpen(false)}
        onGenerated={handleGenerated}
      />
    </>
  );
}
