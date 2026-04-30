"use client";

import type { DocumentResponse } from "@/types/document";
import { ConfirmArchiveModal } from "@/components/ui/confirm-archive-modal";
import { useRef, useState } from "react";

type DocumentListItemProps = {
  document: DocumentResponse;
  showArchived: boolean;
  onDelete: (id: string) => void;
  onClick: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
};

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-yellow-500/10 text-yellow-400",
  READY: "bg-green-500/10 text-green-400",
  ARCHIVED: "bg-zinc-700 text-zinc-400",
  UPLOADED: "bg-blue-500/10 text-blue-400",
};

function TypeIcon({ type }: { type: string }) {
  if (type === "RESUME") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 text-zinc-500"
        aria-hidden="true"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    );
  }
  if (type === "COVER_LETTER") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 text-zinc-500"
        aria-hidden="true"
      >
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    );
  }
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-zinc-500"
      aria-hidden="true"
    >
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <polyline points="13 2 13 9 20 9" />
    </svg>
  );
}

export default function DocumentListItem({ document, showArchived, onDelete, onClick, onDuplicate, onRename, onArchive, onRestore }: DocumentListItemProps) {
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(document.name);
  const [pendingArchive, setPendingArchive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const formattedDate = new Date(document.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  function startRename(e: React.MouseEvent) {
    e.stopPropagation();
    setRenameValue(document.name);
    setRenaming(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function commitRename() {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== document.name) {
      onRename(document.id, trimmed);
    }
    setRenaming(false);
  }

  function handleRenameKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") commitRename();
    if (e.key === "Escape") setRenaming(false);
  }


  return (
    <>
      <div className="bg-zinc-900 border border-zinc-700 hover:border-zinc-500 rounded-lg px-5 py-4 transition-colors">
        <div className="flex items-center gap-4">
          {/* Nav click area */}
          <button
            type="button"
            className="flex-1 min-w-0 text-left"
            onClick={() => !renaming && onClick(document.id)}
            aria-label={`View ${document.name}`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <TypeIcon type={document.type} />
              {renaming ? (
                <input
                  ref={inputRef}
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={handleRenameKeyDown}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-zinc-800 border border-indigo-500 rounded-md px-2 py-0.5 text-sm font-medium text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
                />
              ) : (
                <span className="text-sm font-medium text-zinc-50 truncate">{document.name}</span>
              )}
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[document.status] ?? STATUS_STYLES.DRAFT}`}>
                {document.status}
              </span>
              <span className="text-xs text-zinc-500">v{document.versionNumber}</span>
              <span className="text-xs text-zinc-500 whitespace-nowrap">{formattedDate}</span>
            </div>
          </button>

          {/* Action icons */}
          <div className="flex items-center gap-1 shrink-0">
            {showArchived ? (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRestore(document.id); }}
                className="p-1.5 text-zinc-500 hover:text-green-400 transition-colors"
                aria-label="Restore"
                title="Restore"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
                </svg>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={startRename}
                  className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label="Rename" title="Rename"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onDuplicate(document.id); }}
                  className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label="Duplicate" title="Duplicate"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setPendingArchive(true); }}
                  className="p-1.5 text-zinc-500 hover:text-orange-400 transition-colors"
                  aria-label="Archive" title="Archive"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="21 8 21 21 3 21 3 8" />
                    <rect x="1" y="3" width="22" height="5" />
                    <line x1="10" y1="12" x2="14" y2="12" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onDelete(document.id); }}
                  className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                  aria-label="Delete" title="Delete"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <ConfirmArchiveModal
        open={pendingArchive}
        onClose={() => setPendingArchive(false)}
        onConfirm={() => { onArchive(document.id); setPendingArchive(false); }}
        itemName={document.name}
      />
    </>
  );
}
