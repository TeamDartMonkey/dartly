"use client";

import { useState } from "react";
import { cn } from "@/utils/cn";

type CompletionItem = {
  label: string;
  complete: boolean;
};

type CompletionIndicatorProps = {
  items: CompletionItem[];
  totalLabel: string;
};

export function CompletionIndicator({ items, totalLabel }: CompletionIndicatorProps) {
  const [expanded, setExpanded] = useState(false);
  const completed = items.filter((f) => f.complete).length;
  const total = items.length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left group"
      >
        <div className="flex items-center gap-3 mb-1.5">
          <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                percent === 100 ? "bg-green-400" : percent >= 50 ? "bg-yellow-400" : "bg-red-400"
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-xs text-zinc-500 shrink-0">{totalLabel}</span>
          <span
            className={cn(
              "text-xs font-medium shrink-0",
              percent === 100 ? "text-green-400" : "text-zinc-400"
            )}
          >
            {percent}%
          </span>
          <svg
            className={cn("shrink-0 text-zinc-500 transition-transform", expanded && "rotate-180")}
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
        </div>
      </button>

      {expanded && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 py-2 animate-[fadeIn_150ms_ease-out]">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 text-xs">
              {item.complete ? (
                <svg
                  className="shrink-0 text-green-400"
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
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              ) : (
                <svg
                  className="shrink-0 text-zinc-600"
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
                  <circle cx="12" cy="12" r="10" />
                </svg>
              )}
              <span className={item.complete ? "text-zinc-300" : "text-zinc-500"}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
