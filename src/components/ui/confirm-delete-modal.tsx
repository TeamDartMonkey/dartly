"use client";

import { Modal } from "@/components/ui/modal";

type ConfirmDeleteModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
  message?: string;
};

export function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  itemName,
  message = "This action cannot be undone.",
}: ConfirmDeleteModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-400/10 mb-4">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-red-400"
            aria-hidden="true"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </div>

        <h2 className="text-lg font-semibold text-zinc-50 mb-1">
          {itemName ? (
            <>
              Delete <span className="text-zinc-300">&ldquo;{itemName}&rdquo;</span>?
            </>
          ) : (
            "Delete this item?"
          )}
        </h2>

        <p className="text-sm text-zinc-400 mb-6">{message}</p>

        <div className="flex items-center gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-200 px-4 py-2.5 rounded-md text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-zinc-50 px-4 py-2.5 rounded-md text-sm font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}
