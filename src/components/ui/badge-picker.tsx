"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

type BadgePickerOption = {
  value: string;
  label: string;
  badge: string;
  dot: string;
};

type BadgePickerProps = {
  value: string;
  options: BadgePickerOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function BadgePicker({ value, options, onChange, disabled }: BadgePickerProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (popoverRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function getPopoverStyle(): React.CSSProperties {
    if (!triggerRef.current) return { display: "none" };
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const approxHeight = options.length * 36 + 16;
    const openAbove = spaceBelow < approxHeight;
    return {
      position: "fixed",
      top: openAbove ? undefined : rect.bottom + 4,
      bottom: openAbove ? window.innerHeight - rect.top + 4 : undefined,
      left: rect.left,
      zIndex: 60,
    };
  }

  function handleSelect(val: string) {
    onChange(val);
    setOpen(false);
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={[
          `inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-opacity ${current.badge}`,
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:opacity-80",
        ].join(" ")}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Stage: ${current.label}. Click to change.`}
      >
        <span className={`inline-block h-1.5 w-1.5 rounded-full ${current.dot}`} />
        {current.label}
        <svg
          className="shrink-0 opacity-50"
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {mounted &&
        open &&
        !disabled &&
        createPortal(
          <div
            ref={popoverRef}
            id={`${id}-popover`}
            role="listbox"
            className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl py-1 min-w-[140px] animate-[scaleIn_150ms_ease-out]"
            style={getPopoverStyle()}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                onClick={() => handleSelect(option.value)}
                className="w-full text-left px-3 py-1.5 text-sm transition-colors hover:bg-zinc-800 flex items-center gap-2"
              >
                <span className={`inline-block h-2 w-2 rounded-full ${option.dot}`} />
                <span
                  className={option.value === value ? "text-zinc-100 font-medium" : "text-zinc-300"}
                >
                  {option.label}
                </span>
                {option.value === value && (
                  <svg
                    className="ml-auto text-indigo-400"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
