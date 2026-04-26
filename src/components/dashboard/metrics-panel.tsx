"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { STAGE_STYLES } from "@/constants/job-stages";
import type { JobStage } from "@/types/job";
import type { DashboardMetrics } from "@/services/metrics";

const PIPELINE_ORDER: JobStage[] = [
  "Interested",
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
  "Ghosted",
  "Archived",
];

const STORAGE_KEY = "dartly:metrics-expanded";

export function MetricsPanel({ refreshKey }: { refreshKey: number }) {
  const router = useRouter();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setExpanded(stored === null ? true : stored === "true");
  }, []);

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKey intentionally triggers re-fetch
  useEffect(() => {
    setLoading(true);
    fetch("/api/metrics")
      .then((res) => {
        if (res.status === 401) {
          router.push("/login");
          return null;
        }
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data) setMetrics(data);
      })
      .finally(() => setLoading(false));
  }, [router, refreshKey]);

  if (loading) {
    return (
      <div className="mb-6">
        <div className="h-8 w-48 animate-pulse rounded bg-zinc-800" />
        <div className="mt-3 grid grid-cols-3 gap-3">
          {["a", "b", "c", "d", "e", "f"].map((key) => (
            <div
              key={key}
              className="h-20 animate-pulse rounded-lg border border-zinc-700 bg-zinc-800/50"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!metrics || metrics.totalJobs === 0) return null;

  if (expanded === null) return null;

  const cards = [
    {
      label: "Total Jobs",
      value: metrics.totalJobs,
      accent: "border-l-zinc-500",
    },
    {
      label: "Active",
      value: metrics.activeApplications,
      accent: "border-l-blue-400",
    },
    {
      label: "Response Rate",
      value: `${metrics.responseRate}%`,
      accent: "border-l-zinc-400",
    },
    {
      label: "Interview Rate",
      value: `${metrics.interviewRate}%`,
      accent: "border-l-yellow-400",
    },
    {
      label: "Rejection Rate",
      value: `${metrics.rejectionRate}%`,
      accent: "border-l-red-400",
    },
    {
      label: "Ghost Rate",
      value: `${metrics.ghostRate}%`,
      accent: "border-l-purple-400",
    },
  ];

  const totalForBar = PIPELINE_ORDER.reduce(
    (sum, stage) => sum + (metrics.stageCounts[stage] ?? 0),
    0
  );

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={toggleExpanded}
        className="flex w-full items-center gap-2 group"
      >
        <svg
          className={`h-4 w-4 text-zinc-500 transition-transform ${expanded ? "rotate-90" : ""}`}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 4 10 8 6 12" />
        </svg>
        <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">
          Dashboard Stats
        </span>
        {metrics.offerCount > 0 && (
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-green-800 bg-green-950 px-2.5 py-0.5 text-xs font-medium text-green-400">
            <svg
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
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {metrics.offerCount} {metrics.offerCount === 1 ? "Offer" : "Offers"}
          </span>
        )}
      </button>

      {expanded && (
        <div className="mt-3 grid grid-cols-3 gap-3">
          {cards.map((card) => (
            <div
              key={card.label}
              className={`rounded-lg border border-zinc-700 border-l-[3px] ${card.accent} bg-zinc-800/50 p-4 transition-shadow hover:shadow-[0_0_12px_-3px_rgba(161,161,170,0.15)]`}
            >
              <p className="text-xs text-zinc-400">{card.label}</p>
              <p className="mt-1.5 text-xl font-semibold text-zinc-50">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {totalForBar > 0 && (
        <div className={`rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 ${expanded ? "mt-3" : "mt-2"}`}>
          <div className="flex h-3 overflow-hidden rounded-full bg-zinc-900">
            {PIPELINE_ORDER.map((stage) => {
              const count = metrics.stageCounts[stage] ?? 0;
              if (count === 0) return null;
              const rawWidth = (count / totalForBar) * 100;
              return (
                <div
                  key={stage}
                  className={`${STAGE_STYLES[stage].dot} transition-all`}
                  style={{ width: `${rawWidth}%`, minWidth: "2px" }}
                  title={`${stage}: ${count}`}
                />
              );
            })}
          </div>
          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
            {PIPELINE_ORDER.map((stage) => {
              const count = metrics.stageCounts[stage] ?? 0;
              return (
                <span key={stage} className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${STAGE_STYLES[stage].dot}`}
                  />
                  {stage}
                  <span className="text-zinc-500">·</span>
                  <span className="font-medium text-zinc-300">{count}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
