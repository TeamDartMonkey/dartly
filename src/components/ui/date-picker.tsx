"use client";

import { format, parse } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { type ChevronProps, DayPicker, type Matcher } from "react-day-picker";
import { createPortal } from "react-dom";
import "react-day-picker/style.css";
import { Label } from "@/components/ui/label";

function Chevron({ orientation, ...props }: ChevronProps) {
  if (orientation === "left") {
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
        {...props}
      >
        <title>Previous month</title>
        <polyline points="15 18 9 12 15 6" />
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
      {...props}
    >
      <title>Next month</title>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

type DatePickerProps = {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  /** YYYY-MM-DD — earliest selectable date (inclusive) */
  minDate?: string;
  /** YYYY-MM-DD — latest selectable date (inclusive) */
  maxDate?: string;
};

export function DatePicker({
  id,
  label,
  value,
  onChange,
  placeholder = "Select date",
  error,
  required,
  disabled,
  minDate,
  maxDate,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

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
      const popover = document.getElementById(`${id}-popover`);
      if (popover?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [id, open]);

  const selected = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
  const displayValue = selected ? format(selected, "MMM d, yyyy") : "";
  const minDateParsed = minDate ? parse(minDate, "yyyy-MM-dd", new Date()) : undefined;
  const maxDateParsed = maxDate ? parse(maxDate, "yyyy-MM-dd", new Date()) : undefined;
  const disabledMatchers: Matcher[] = [];
  if (minDateParsed) disabledMatchers.push({ before: minDateParsed });
  if (maxDateParsed) disabledMatchers.push({ after: maxDateParsed });

  function handleSelect(date: Date | undefined) {
    if (date) {
      onChange(format(date, "yyyy-MM-dd"));
      setOpen(false);
    }
  }

  function getPopoverStyle(): React.CSSProperties {
    if (!triggerRef.current) return { display: "none" };
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const approxHeight = 340;
    const openAbove = spaceBelow < approxHeight;
    return {
      position: "fixed",
      top: openAbove ? undefined : rect.bottom + 4,
      bottom: openAbove ? window.innerHeight - rect.top + 4 : undefined,
      left: rect.left,
    };
  }

  return (
    <div>
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}
      <button
        id={id}
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={[
          "w-full bg-zinc-800 border rounded-md px-3 py-2 text-sm text-left flex items-center justify-between gap-2",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error ? "border-red-500" : "border-zinc-700",
        ].join(" ")}
        aria-label={value ? `Selected: ${displayValue}` : placeholder}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={value ? "text-zinc-50" : "text-zinc-500"}>
          {value ? displayValue : placeholder}
        </span>
        <svg
          className="shrink-0 text-zinc-500"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            id={`${id}-popover`}
            className="rdp-dartly z-[60] bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl p-3 animate-[scaleIn_150ms_ease-out]"
            style={getPopoverStyle()}
            role="dialog"
            aria-label="Choose date"
          >
            <DayPicker
              mode="single"
              captionLayout="dropdown"
              navLayout="around"
              components={{ Chevron }}
              selected={selected}
              onSelect={handleSelect}
              disabled={disabledMatchers.length > 0 ? disabledMatchers : undefined}
              startMonth={new Date(1970, 0)}
              endMonth={new Date(2035, 11)}
              defaultMonth={selected ?? minDateParsed ?? new Date()}
            />
          </div>,
          document.body
        )}

      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
