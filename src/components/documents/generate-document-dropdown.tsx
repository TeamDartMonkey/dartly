"use client";

import { useEffect, useRef, useState } from "react";

type GenerateDocumentDropdownProps = {
  onPickMode: (mode: "resume" | "cover-letter") => void;
};

export function GenerateDocumentDropdown({ onPickMode }: GenerateDocumentDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(mode: "resume" | "cover-letter") {
    setOpen(false);
    onPickMode(mode);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="bg-indigo-500 hover:bg-indigo-600 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium inline-flex items-center gap-1.5"
      >
        Generate
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
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-44 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg py-1">
          <button
            type="button"
            onClick={() => handleSelect("resume")}
            className="w-full text-left px-3 py-2 text-sm text-zinc-50 hover:bg-zinc-700"
          >
            Resume
          </button>
          <button
            type="button"
            onClick={() => handleSelect("cover-letter")}
            className="w-full text-left px-3 py-2 text-sm text-zinc-50 hover:bg-zinc-700"
          >
            Cover Letter
          </button>
        </div>
      )}
    </div>
  );
}
