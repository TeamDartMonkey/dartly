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

function time24ToParts(time24: string): { hour: string; minute: string; period: "AM" | "PM" } {
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return { hour: String(hour12), minute: String(m).padStart(2, "0"), period };
}

function partsToTime24(hour: string, minute: string, period: "AM" | "PM"): string {
  let h = parseInt(hour, 10);
  if (Number.isNaN(h)) h = 12;
  h = ((h % 12) + (period === "PM" ? 12 : 0)) % 24;
  let m = parseInt(minute, 10);
  if (Number.isNaN(m)) m = 0;
  m = Math.max(0, Math.min(59, m));
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
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
  minDate?: string;
  maxDate?: string;
  /** When true, includes a time picker. Value format becomes `YYYY-MM-DDTHH:mm`. */
  includeTime?: boolean;
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
  includeTime,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const dateValue = includeTime ? (value ? value.slice(0, 10) : "") : value;
  const timeValue = includeTime && value ? value.slice(11) : "";

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

  const selected = dateValue ? parse(dateValue, "yyyy-MM-dd", new Date()) : undefined;
  const minDateParsed = minDate ? parse(minDate, "yyyy-MM-dd", new Date()) : undefined;
  const maxDateParsed = maxDate ? parse(maxDate, "yyyy-MM-dd", new Date()) : undefined;
  const disabledMatchers: Matcher[] = [];
  if (minDateParsed) disabledMatchers.push({ before: minDateParsed });
  if (maxDateParsed) disabledMatchers.push({ after: maxDateParsed });

  let displayValue = "";
  if (selected) {
    displayValue = format(selected, "MMM d, yyyy");
    if (includeTime && timeValue) {
      const parts = time24ToParts(timeValue);
      displayValue += ` ${parts.hour}:${parts.minute} ${parts.period}`;
    }
  }

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    const dateStr = format(date, "yyyy-MM-dd");
    if (includeTime) {
      const time = timeValue || "09:00";
      onChange(`${dateStr}T${time}`);
    } else {
      onChange(dateStr);
      setOpen(false);
    }
  }

  function handleTimeChange(field: "hour" | "minute" | "period", val: string) {
    const current = timeValue || "09:00";
    const parts = time24ToParts(current);
    const updated = { ...parts, [field]: field === "period" ? (val as "AM" | "PM") : val };
    const dateStr = dateValue || format(new Date(), "yyyy-MM-dd");
    onChange(`${dateStr}T${partsToTime24(updated.hour, updated.minute, updated.period)}`);
  }

  function handleTimeBlur() {
    if (!timeValue) return;
    const parts = time24ToParts(timeValue);
    const h = parseInt(parts.hour, 10);
    const m = parseInt(parts.minute, 10);
    if (Number.isNaN(h) || Number.isNaN(m)) return;
    const dateStr = dateValue || format(new Date(), "yyyy-MM-dd");
    onChange(`${dateStr}T${partsToTime24(String(h), String(m), parts.period)}`);
  }

  function getPopoverStyle(): React.CSSProperties {
    if (!triggerRef.current) return { display: "none" };
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const approxHeight = includeTime ? 410 : 340;
    const openAbove = spaceBelow < approxHeight;
    return {
      position: "fixed",
      top: openAbove ? undefined : rect.bottom + 4,
      bottom: openAbove ? window.innerHeight - rect.top + 4 : undefined,
      left: rect.left,
    };
  }

  const timeParts = timeValue ? time24ToParts(timeValue) : { hour: "9", minute: "00", period: "AM" as const };

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
            {includeTime && (
              <div className="mt-3 pt-3 border-t border-zinc-700 flex items-center gap-2">
                <span className="text-[10px] font-medium text-zinc-500 shrink-0">Time</span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  value={timeParts.hour}
                  onChange={(e) => handleTimeChange("hour", e.target.value)}
                  onBlur={handleTimeBlur}
                  className="w-10 bg-zinc-800 border border-zinc-700 rounded-md px-1.5 py-1 text-xs text-zinc-50 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Hour"
                />
                <span className="text-xs text-zinc-500">:</span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  value={timeParts.minute}
                  onChange={(e) => handleTimeChange("minute", e.target.value)}
                  onBlur={handleTimeBlur}
                  className="w-10 bg-zinc-800 border border-zinc-700 rounded-md px-1.5 py-1 text-xs text-zinc-50 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Minute"
                />
                <button
                  type="button"
                  onClick={() => handleTimeChange("period", timeParts.period === "AM" ? "PM" : "AM")}
                  className="bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-xs text-zinc-50 hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Toggle AM/PM"
                >
                  {timeParts.period}
                </button>
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="bg-indigo-500 hover:bg-indigo-600 text-zinc-50 px-3 py-1.5 rounded-md text-xs font-medium"
                >
                  Done
                </button>
              </div>
            )}
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
