"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
  exiting: boolean;
};

type AddToast = (message: string, type?: ToastType) => void;

let nextId = 0;
const listeners = new Set<AddToast>();

export function showToast(message: string, type: ToastType = "success") {
  for (const listener of listeners) {
    listener(message, type);
  }
}

const ACCENT: Record<ToastType, string> = {
  success: "border-l-emerald-400",
  error: "border-l-red-400",
  info: "border-l-indigo-400",
};

const ICON_BG: Record<ToastType, string> = {
  success: "bg-emerald-400/10 text-emerald-400",
  error: "bg-red-400/10 text-red-400",
  info: "bg-indigo-400/10 text-indigo-400",
};

const PROGRESS: Record<ToastType, string> = {
  success: "bg-emerald-400",
  error: "bg-red-400",
  info: "bg-indigo-400",
};

function ToastIcon({ type }: { type: ToastType }) {
  if (type === "success") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  }
  if (type === "error") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
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
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

const DURATION = 3500;

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const trackTimer = useCallback((cb: () => void, ms: number) => {
    const t = setTimeout(() => {
      timersRef.current.delete(t);
      cb();
    }, ms);
    timersRef.current.add(t);
    return t;
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, message, type, exiting: false }]);

      trackTimer(() => {
        setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
      }, DURATION);

      trackTimer(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, DURATION + 300);
    },
    [trackTimer]
  );

  useEffect(() => {
    listeners.add(addToast);
    return () => {
      listeners.delete(addToast);
    };
  }, [addToast]);

  // Clear pending timers on unmount so setState does not run on a dead tree.
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const t of timers) clearTimeout(t);
      timers.clear();
    };
  }, []);

  function dismiss(id: number) {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    trackTimer(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[60] flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          className={[
            "pointer-events-auto relative flex items-center gap-3 min-w-[320px] max-w-[420px]",
            "bg-zinc-900/95 backdrop-blur-sm border border-zinc-700/60 border-l-[3px] rounded-lg shadow-2xl overflow-hidden",
            ACCENT[toast.type],
            toast.exiting
              ? "animate-[toastOut_300ms_ease-in_forwards]"
              : "animate-[toastIn_300ms_ease-out]",
          ].join(" ")}
        >
          <div className={`ml-3 shrink-0 rounded-md p-1.5 ${ICON_BG[toast.type]}`}>
            <ToastIcon type={toast.type} />
          </div>

          <p className="flex-1 py-3 pr-2 text-sm text-zinc-200 leading-snug">{toast.message}</p>

          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            className="shrink-0 mr-1.5 rounded-md p-1 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
            aria-label="Dismiss"
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div
            className={`absolute bottom-0 left-0 h-[2px] ${PROGRESS[toast.type]}`}
            // Inline animation so the duration constant is honored regardless
            // of Tailwind v4's static-extraction limits on dynamic class names.
            style={{ width: "100%", animation: `progressShrink ${DURATION}ms linear forwards` }}
          />
        </div>
      ))}
    </div>
  );
}
