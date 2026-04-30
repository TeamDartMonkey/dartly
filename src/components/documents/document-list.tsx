import DocumentCard from "@/components/documents/document-card";
import DocumentListItem from "@/components/documents/document-list-item";
import type { DocumentResponse } from "@/types/document";
import type { ViewMode } from "@/types/job";

type DocumentListProps = {
  documents: DocumentResponse[];
  viewMode: ViewMode;
  showArchived: boolean;
  onClick: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onGenerate: () => void;
};

export default function DocumentList({
  documents,
  viewMode,
  showArchived,
  onClick,
  onDelete,
  onDuplicate,
  onRename,
  onArchive,
  onRestore,
  onGenerate,
}: DocumentListProps) {
  if (!documents || documents.length === 0) {
    return (
      <div className="bg-zinc-900 border border-dashed border-zinc-700 rounded-lg p-10 text-center">
        <svg
          className="mx-auto mb-3 text-zinc-600"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
        {showArchived ? (
          <p className="text-sm text-zinc-400">No archived documents.</p>
        ) : (
          <>
            <p className="text-sm text-zinc-400">No documents yet.</p>
            <button
              type="button"
              onClick={onGenerate}
              className="mt-2 text-sm text-indigo-400 hover:text-indigo-300"
            >
              Generate your first document
            </button>
          </>
        )}
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-2">
        {documents.map((doc) => (
          <DocumentListItem key={doc.id} document={doc} showArchived={showArchived} onDelete={onDelete} onClick={onClick} onDuplicate={onDuplicate} onRename={onRename} onArchive={onArchive} onRestore={onRestore} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {documents.map((doc) => (
        <DocumentCard key={doc.id} document={doc} showArchived={showArchived} onDelete={onDelete} onClick={onClick} onDuplicate={onDuplicate} onRename={onRename} onArchive={onArchive} onRestore={onRestore} />
      ))}
    </div>
  );
}
