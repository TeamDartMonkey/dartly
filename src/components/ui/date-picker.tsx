"use client";

import { format, parse } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { createPortal } from "react-dom";
import "react-day-picker/style.css";
import { Label } from "@/components/ui/label";

type DatePickerProps = {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
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
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    function measure() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setCoords({ top: rect.bottom + 4, left: rect.left });
    }
    measure();
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (popoverRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const selected = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
  const displayValue = value && selected ? format(selected, "MMM yyyy") : "";

  function handleSelect(date: Date | undefined) {
    if (date) {
      onChange(format(date, "yyyy-MM-dd"));
    } else {
      onChange("");
    }
    setOpen(false);
  }

  return (
    <div className="relative">
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}
      <button
        ref={triggerRef}
        id={id}
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

      {mounted && open && coords
        ? createPortal(
            <div
              ref={popoverRef}
              style={{
                position: "fixed",
                top: coords.top,
                left: coords.left,
              }}
              className="z-[60] bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl p-3 rdp-dartly"
              role="dialog"
            >
              <DayPicker
                mode="single"
                selected={selected}
                onSelect={handleSelect}
                captionLayout="dropdown"
                startMonth={new Date(1970, 0)}
                endMonth={new Date(2035, 11)}
                locale={enUS}
              />
            </div>,
            document.body
          )
        : null}

      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
