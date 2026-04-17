"use client";

import type { DocumentResponse } from "@/types/document";

type DocumentListItemProps = {
  document: DocumentResponse;
  onDelete: (id: string) => void;
  onClick: (id: string) => void;
};

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-yellow-500/10 text-yellow-400",
  READY: "bg-green-500/10 text-green-400",
  ARCHIVED: "bg-zinc-700 text-zinc-400",
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

export default function DocumentListItem({ document, onDelete, onClick }: DocumentListItemProps) {
  const formattedDate = new Date(document.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-zinc-900 border border-zinc-700 hover:border-zinc-500 rounded-lg px-5 py-4 transition-colors">
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="flex-1 min-w-0 text-left"
          onClick={() => onClick(document.id)}
          aria-label={`View ${document.name}`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <TypeIcon type={document.type} />
            <span className="text-sm font-medium text-zinc-50 truncate">{document.name}</span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[document.status] ?? STATUS_STYLES.DRAFT}`}
            >
              {document.status}
            </span>
            <span className="text-xs text-zinc-500">v{document.versionNumber}</span>
            <span className="text-xs text-zinc-500 whitespace-nowrap">{formattedDate}</span>
          </div>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(document.id);
          }}
          className="shrink-0 p-1.5 text-zinc-600 transition-colors hover:text-red-400"
          aria-label="Delete"
          title="Delete"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
