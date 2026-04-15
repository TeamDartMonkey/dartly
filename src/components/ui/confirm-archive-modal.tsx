"use client";

import { Modal } from "@/components/ui/modal";

type ConfirmArchiveModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
  message?: string;
  isSubmitting?: boolean;
};

export function ConfirmArchiveModal({
  open,
  onClose,
  onConfirm,
  itemName,
  message = "You can restore this later.",
  isSubmitting = false,
}: ConfirmArchiveModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-400/10 mb-4">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-orange-400"
            aria-hidden="true"
          >
            <polyline points="21 8 21 21 3 21 3 8" />
            <rect x="1" y="3" width="22" height="5" />
            <line x1="10" y1="12" x2="14" y2="12" />
          </svg>
        </div>

        <h2 className="text-lg font-semibold text-zinc-50 mb-1">
          {itemName ? (
            <>
              Archive <span className="text-zinc-300">&ldquo;{itemName}&rdquo;</span>?
            </>
          ) : (
            "Archive this item?"
          )}
        </h2>

        <p className="text-sm text-zinc-400 mb-6">{message}</p>

        <div className="flex items-center gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-200 px-4 py-2.5 rounded-md text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-zinc-50 px-4 py-2.5 rounded-md text-sm font-medium transition-colors"
          >
            { isSubmitting ? "Saving..." : "Archive" }
          </button>
        </div>
      </div>
    </Modal>
  );
}
