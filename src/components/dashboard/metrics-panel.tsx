"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type DashboardMetrics = {
  stageCounts: Record<string, number>;
  totalJobs: number;
  responseRate: number;
  averageTimeToResponse: number | null;
  activeApplications: number;
};

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
    const skeletonKeys = ["total", "active", "rate", "avg"];
    return (
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
    { label: "Total Jobs", value: metrics.totalJobs },
    { label: "Active", value: metrics.activeApplications },
    {
      label: "Response Rate",
      value: `${metrics.responseRate}%`,
    },
    {
      label: "Avg Response",
      value: metrics.averageTimeToResponse !== null ? `${metrics.averageTimeToResponse}d` : "N/A",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
          <p className="text-xs text-zinc-400">{card.label}</p>
          <p className="mt-1 text-xl font-semibold text-zinc-50">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
