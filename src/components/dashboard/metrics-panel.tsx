"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { STAGE_STYLES } from "@/constants/job-stages";
import type { JobStage } from "@/types/job";
import type { AnalyticsBreakdown, DashboardMetrics } from "@/services/metrics";

type MetricsResponse = DashboardMetrics & { analytics?: AnalyticsBreakdown };

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
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Bumped manually to force a re-fetch on Retry without disturbing the
  // upstream refreshKey contract (which is owned by the dashboard).
  const [retryNonce, setRetryNonce] = useState(0);
  // Lazy-init from localStorage so the panel renders in the correct expanded
  // state on first paint instead of flickering after hydration.
  const [expanded, setExpanded] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : stored === "true";
  });

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        /* private mode / quota — ignore */
      }
      return next;
    });
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKey/retryNonce intentionally trigger re-fetch
  useEffect(() => {
    setLoading(true);
    setError(null);
    const ctrl = new AbortController();
    fetch("/api/metrics", { signal: ctrl.signal })
      .then(async (res) => {
        if (res.status === 401) {
          router.push("/login");
          return null;
        }
        if (!res.ok) {
          // Surface a real error rather than silently hiding the panel,
          // which had been indistinguishable from the empty state.
          throw new Error(`Metrics request failed (${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        if (ctrl.signal.aborted) return;
        if (data) setMetrics(data);
      })
      .catch((err) => {
        if (ctrl.signal.aborted || err?.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Failed to load metrics");
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, [router, refreshKey, retryNonce]);

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

  if (error) {
    return (
      <div
        role="alert"
        className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/5 p-4"
      >
        <div className="min-w-0">
          <p className="text-sm font-medium text-red-300">Couldn&rsquo;t load metrics</p>
          <p className="text-xs text-red-400/80">{error}</p>
        </div>
        <button
          type="button"
          onClick={() => setRetryNonce((n) => n + 1)}
          className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-500/20 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!metrics || metrics.totalJobs === 0) return null;

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
        <div
          className={`rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 ${expanded ? "mt-3" : "mt-2"}`}
        >
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

      {expanded && metrics.analytics && <AnalyticsSection analytics={metrics.analytics} />}
    </div>
  );
}

function AnalyticsSection({ analytics }: { analytics: AnalyticsBreakdown }) {
  const { velocity, funnel, timeInStage } = analytics;
  const maxWeekly = Math.max(1, ...velocity.weeklyCounts);
  const maxFunnel = Math.max(1, funnel.reachedInterested);

  const changeArrow = velocity.changePercent > 0 ? "▲" : velocity.changePercent < 0 ? "▼" : "•";
  const changeColor =
    velocity.changePercent > 0
      ? "text-green-400"
      : velocity.changePercent < 0
        ? "text-red-400"
        : "text-zinc-500";
  const velocityInsight =
    velocity.last30Days === 0
      ? "No applications in the last 30 days"
      : velocity.prior30Days === 0
        ? `${velocity.last30Days} applications in the last 30 days`
        : `${changeArrow} ${Math.abs(velocity.changePercent)}% vs prior 30 days`;

  const funnelRows: { label: JobStage; count: number; rate: number | null }[] = [
    { label: "Interested", count: funnel.reachedInterested, rate: null },
    { label: "Applied", count: funnel.reachedApplied, rate: funnel.appliedRate },
    { label: "Interview", count: funnel.reachedInterview, rate: funnel.interviewRate },
    { label: "Offer", count: funnel.reachedOffer, rate: funnel.offerRate },
  ];

  const stagesWithTime = (["INTERESTED", "APPLIED", "INTERVIEW"] as const).filter(
    (s) => typeof timeInStage[s] === "number"
  );

  return (
    <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
      {/* Velocity */}
      <div className="rounded-lg border border-zinc-700 border-l-[3px] border-l-blue-400 bg-zinc-800/50 p-4">
        <div className="flex items-baseline justify-between">
          <p className="text-xs text-zinc-400">Velocity (last 30 days)</p>
          <p className={`text-xs font-medium ${changeColor}`}>{velocityInsight}</p>
        </div>
        <p className="mt-1.5 text-xl font-semibold text-zinc-50">
          {velocity.last30Days}
          <span className="ml-1.5 text-xs font-normal text-zinc-500">applications</span>
        </p>
        <div className="mt-3 flex h-10 items-end gap-1">
          {velocity.weeklyCounts.map((count, i) => {
            const height = (count / maxWeekly) * 100;
            const weekStart = velocity.weekStartIsos[i];
            return (
              <div
                key={weekStart || i}
                className="flex-1 rounded-sm bg-blue-500/30 transition-all hover:bg-blue-500/60"
                style={{ height: `${Math.max(height, 4)}%` }}
                title={`${count} application${count === 1 ? "" : "s"} this week`}
              />
            );
          })}
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-zinc-500">
          <span>4w ago</span>
          <span>this week</span>
        </div>
      </div>

      {/* Funnel */}
      <div className="rounded-lg border border-zinc-700 border-l-[3px] border-l-yellow-400 bg-zinc-800/50 p-4">
        <p className="text-xs text-zinc-400">Stage Conversion</p>
        <div className="mt-3 space-y-2">
          {funnelRows.map(({ label, count, rate }) => {
            const width = (count / maxFunnel) * 100;
            return (
              <div key={label}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300">{label}</span>
                  <span className="text-zinc-400">
                    {count}
                    {rate !== null && <span className="ml-1.5 text-zinc-500">({rate}%)</span>}
                  </span>
                </div>
                <div className="mt-0.5 h-1.5 rounded-full bg-zinc-900">
                  <div
                    className={`h-full rounded-full ${STAGE_STYLES[label].dot} transition-all`}
                    style={{ width: `${width}%`, minWidth: count > 0 ? "4px" : "0" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Time in stage */}
      <div className="rounded-lg border border-zinc-700 border-l-[3px] border-l-zinc-400 bg-zinc-800/50 p-4">
        <p className="text-xs text-zinc-400">Avg. time in stage</p>
        {stagesWithTime.length === 0 ? (
          <p className="mt-3 text-xs text-zinc-500">
            Move jobs between stages to see how long each stage takes.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {stagesWithTime.map((s) => {
              const days = timeInStage[s] ?? 0;
              const label =
                s === "INTERESTED" ? "Interested" : s === "APPLIED" ? "Applied" : "Interview";
              return (
                <li key={s} className="flex items-baseline justify-between text-sm">
                  <span className="text-zinc-300">{label}</span>
                  <span className="text-zinc-50">
                    {days}{" "}
                    <span className="text-xs text-zinc-500">{days === 1 ? "day" : "days"}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
