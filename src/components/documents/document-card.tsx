"use client";

import type { DocumentResponse } from "@/types/document";
import { useRef, useState } from "react";

type DocumentCardProps = {
  document: DocumentResponse;
  onDelete: (id: string) => void;
  onClick: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string, newName: string) => void;
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

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-yellow-500/10 text-yellow-400",
  READY: "bg-green-500/10 text-green-400",
  ARCHIVED: "bg-zinc-700 text-zinc-400",
  UPLOADED: "bg-blue-500/10 text-blue-400",
};

export default function DocumentCard({ document, onDelete, onClick, onDuplicate, onRename }: DocumentCardProps) {
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(document.name);
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
    <div className="group relative flex flex-col bg-zinc-900 border border-zinc-700 hover:border-zinc-500 rounded-lg shadow-sm p-6 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TYPE_STYLES[document.type] ?? TYPE_STYLES.OTHER}`}
          >
            {TYPE_LABELS[document.type] ?? "Other"}
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[document.status] ?? STATUS_STYLES.DRAFT}`}
          >
            {document.status}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/*Rename Button*/}
          <button
            type="button"
            onClick={startRename}
            className="p-1.5 text-zinc-600 hover:text-zinc-300 transition-colors"
            aria-label="Rename"
            title="Rename"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
          </button>

          {/*Duplicate Button*/}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDuplicate(document.id); }}
            className="p-1.5 text-zinc-600 hover:text-zinc-300 transition-colors"
            aria-label="Duplicate"
            title="Duplicate"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>

          {/*Delete Button*/}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(document.id); }}
            className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors"
            aria-label="Delete"
            title="Delete"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 min-w-0 mt-3">
        {renaming ? (
          <input
            ref={inputRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={handleRenameKeyDown}
            className="w-full bg-zinc-800 border border-indigo-500 rounded-md px-2 py-1 text-base font-medium text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <button
            type="button"
            className="w-full text-left"
            onClick={() => onClick(document.id)}
            aria-label={`View ${document.name}`}
          >
            <h2 className="text-base font-medium text-zinc-50 truncate">{document.name}</h2>
          </button>
        )}
        <p className="mt-1 text-xs text-zinc-500">
          v{document.versionNumber} &middot; {formattedDate}
        </p>
      </div>
    </div>
  );
}
