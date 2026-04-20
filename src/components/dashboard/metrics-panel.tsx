"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { STAGE_STYLES } from "@/constants/job-stages";
import type { JobStage } from "@/types/job";

type DashboardMetrics = {
  stageCounts: Record<string, number>;
  totalJobs: number;
  activeApplications: number;
  responseRate: number;
  interviewRate: number;
  rejectionRate: number;
};

const PIPELINE_ORDER: JobStage[] = [
  "Interested",
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
  "Ghosted",
  "Archived",
];

export function MetricsPanel() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, [router]);

  if (loading) {
    const skeletonKeys = ["total", "active", "rate", "interview", "reject"];
    return (
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {skeletonKeys.map((key) => (
          <div
            key={key}
            className="h-20 animate-pulse rounded-lg border border-zinc-700 bg-zinc-800/50"
          />
        ))}
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
  ];

  const totalForBar = PIPELINE_ORDER.reduce(
    (sum, stage) => sum + (metrics.stageCounts[stage] ?? 0),
    0
  );

  return (
    <div className="mb-6 space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
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

      {totalForBar > 0 && (
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
          <p className="mb-3 text-xs font-medium text-zinc-400">Pipeline</p>
          <div className="flex h-3 overflow-hidden rounded-full bg-zinc-900">
            {PIPELINE_ORDER.map((stage) => {
              const count = metrics.stageCounts[stage] ?? 0;
              const width = count > 0 ? Math.max((count / totalForBar) * 100, 0.5) : 0;
              if (width === 0) return null;
              return (
                <div
                  key={stage}
                  className={`${STAGE_STYLES[stage].dot} transition-all`}
                  style={{ width: `${width}%` }}
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
