"use client";

import type { DocumentResponse } from "@/types/document";

type DocumentCardProps = {
  document: DocumentResponse;
  onDelete: (id: string) => void;
  onClick: (id: string) => void;
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
};

export default function DocumentCard({ document, onDelete, onClick }: DocumentCardProps) {
  const formattedDate = new Date(document.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

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
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(document.id);
          }}
          className="p-1.5 text-zinc-600 transition-colors hover:text-red-400"
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

      <button
        type="button"
        className="flex-1 min-w-0 text-left"
        onClick={() => onClick(document.id)}
        aria-label={`View ${document.name}`}
      >
        <h2 className="text-base font-medium text-zinc-50 truncate">{document.name}</h2>
        <p className="mt-1 text-xs text-zinc-500">
          v{document.versionNumber} &middot; {formattedDate}
        </p>
      </button>
    </div>
  );
}
