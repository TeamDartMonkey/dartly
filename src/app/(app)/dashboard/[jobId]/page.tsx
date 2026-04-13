"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { OverviewSection } from "./overview-section";
import { showToast } from "@/components/ui/toast";
import type { Job } from "@/types/job";

const STAGE_STYLES: Record<string, string> = {
  Interested: "bg-zinc-800 text-zinc-300",
  Applied:    "bg-blue-950 text-blue-400",
  Interview:  "bg-amber-950 text-amber-400",
  Offer:      "bg-green-950 text-green-400",
  Rejected:   "bg-red-950 text-red-400",
  Archived:   "bg-zinc-900 text-zinc-500",
};

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const router = useRouter();
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(({ jobId }) => setJobId(jobId));
  }, [params]);

  const fetchJob = useCallback(async () => {
    if (!jobId) return;
    try {
      const res = await fetch(`/api/jobs/${jobId}`);
      if (res.status === 401) { router.push("/login"); return; }
      if (res.status === 404) { router.push("/dashboard"); return; }
      if (!res.ok) throw new Error();
      setJob(await res.json());
    } catch {
      showToast("Failed to load job", "error");
    }
  }, [jobId, router]);

  useEffect(() => {
    if (!jobId) return;
    setLoading(true);
    fetchJob().finally(() => setLoading(false));
  }, [jobId, fetchJob]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-24 bg-zinc-800 rounded" />
        <div className="h-8 w-64 bg-zinc-800 rounded" />
        <div className="h-4 w-40 bg-zinc-800 rounded" />
      </div>
    );
  }

  if (!job) return null;

  return (
    <div>
      <button
        type="button"
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-50 mb-6 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          strokeLinejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to dashboard
      </button>

      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-50">{job.title}</h1>
            <p className="mt-1 text-sm text-zinc-400">
              {job.company}{job.location ? ` · ${job.location}` : ""}
            </p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STAGE_STYLES[job.stage] ?? "bg-zinc-800 text-zinc-300"}`}>
            {job.stage}
          </span>
        </div>
      </div>

      <OverviewSection job={job} onJobUpdated={(updated) => setJob(updated)} />

    </div>
  );
}