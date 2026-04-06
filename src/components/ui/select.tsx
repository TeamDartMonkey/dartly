"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
};

export function Select({ options, value, onChange, placeholder, id, className = "" }: SelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const generatedId = useId();
  const listboxId = `${id ?? generatedId}-listbox`;

  const selected = options.find((o) => o.value === value);
  const selectedIndex = options.findIndex((o) => o.value === value);

  const handleSelect = useCallback(
    (val: string) => {
      onChange(val);
      setOpen(false);
    },
    [onChange]
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  }, [open, selectedIndex]);

  useEffect(() => {
    const el = optionRefs.current[activeIndex];
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  function handleTriggerKey(event: React.KeyboardEvent) {
    switch (event.key) {
      case "ArrowDown":
      case "Enter":
      case " ":
        event.preventDefault();
        setOpen(true);
        break;
      case "Escape":
        setOpen(false);
        break;
    }
  }

  function handleListboxKey(event: React.KeyboardEvent) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((prev) => (prev < options.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        event.preventDefault();
        if (activeIndex >= 0 && activeIndex < options.length) {
          handleSelect(options[activeIndex].value);
        }
        break;
      case "Escape":
        setOpen(false);
        break;
    }
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleTriggerKey}
        className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-left text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent flex items-center justify-between gap-2"
      >
        <span className={selected ? "text-zinc-50" : "text-zinc-500"}>
          {selected ? selected.label : (placeholder ?? "Select...")}
        </span>
        <svg
          className={`shrink-0 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
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
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          onKeyDown={handleListboxKey}
          className="absolute z-50 mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-md shadow-lg py-1 max-h-60 overflow-auto"
        >
          {options.map((option, i) => (
            <div
              key={option.value}
              ref={(el) => {
                optionRefs.current[i] = el;
              }}
              role="option"
              tabIndex={0}
              aria-selected={option.value === value}
              onClick={() => handleSelect(option.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSelect(option.value);
                }
              }}
              className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                option.value === value
                  ? "bg-indigo-500/10 text-indigo-400"
                  : i === activeIndex
                    ? "bg-zinc-700 text-zinc-200"
                    : "text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
