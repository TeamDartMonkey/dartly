"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { showToast } from "@/components/ui/toast";
import type { JobActivity } from "@/types/activity";
import type { Job } from "@/types/job";
import { FollowUpsSection } from "./followups-section";
import { InterviewsSection } from "./interviews-section";
import { OverviewSection } from "./overview-section";
import { TimelineSection } from "./timeline-section";

type Tab = "overview" | "timeline" | "interviews" | "followups";

const STAGE_STYLES: Record<string, string> = {
  Interested: "bg-zinc-800 text-zinc-400",
  Applied: "bg-blue-950 text-blue-400",
  Interview: "bg-yellow-950 text-yellow-400",
  Offer: "bg-green-950 text-green-400",
  Rejected: "bg-red-950 text-red-400",
  Archived: "bg-zinc-900 text-zinc-500",
};

export default function JobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const router = useRouter();
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [activities, setActivities] = useState<JobActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  useEffect(() => {
    params.then(({ jobId }) => setJobId(jobId));
  }, [params]);

  const fetchJob = useCallback(async () => {
    if (!jobId) return;
    try {
      const res = await fetch(`/api/jobs/${jobId}`);
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.status === 404) {
        router.push("/dashboard");
        return;
      }
      if (!res.ok) throw new Error();
      setJob(await res.json());
    } catch {
      showToast("Failed to load job", "error");
    }
  }, [jobId, router]);

  const fetchActivities = useCallback(async () => {
    if (!jobId) return;
    try {
      const res = await fetch(`/api/jobs/${jobId}/activities`);
      if (!res.ok) throw new Error();
      setActivities(await res.json());
    } catch {
      showToast("Failed to load activities", "error");
    }
  }, [jobId]);

  useEffect(() => {
    if (!jobId) return;
    setLoading(true);
    Promise.all([fetchJob(), fetchActivities()]).finally(() => setLoading(false));
  }, [jobId, fetchJob, fetchActivities]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4" role="status" aria-label="Loading job details">
        <div className="h-4 w-24 bg-zinc-800 rounded" />
        <div className="h-8 w-64 bg-zinc-800 rounded" />
        <div className="h-4 w-40 bg-zinc-800 rounded" />
      </div>
    );
  }

  if (!job) return null;

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "timeline", label: "Timeline" },
    { id: "interviews", label: "Interviews" },
    { id: "followups", label: "Follow-ups" },
  ];

  return (
    <div>
      <button
        type="button"
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-50 mb-6 transition-colors"
      >
        <svg
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
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to dashboard
      </button>

      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-50">{job.title}</h1>
            <p className="mt-1 text-sm text-zinc-400">
              {job.company}
              {job.location ? ` · ${job.location}` : ""}
            </p>
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STAGE_STYLES[job.stage] ?? "bg-zinc-800 text-zinc-300"}`}
          >
            {job.stage}
          </span>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Job sections"
        className="flex gap-1 border-b border-zinc-800 mb-6"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-zinc-400 hover:text-zinc-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div role="tabpanel" id="panel-overview" aria-labelledby="tab-overview">
          <OverviewSection job={job} onJobUpdated={(updated) => setJob(updated)} />
        </div>
      )}
      {activeTab === "timeline" && (
        <div role="tabpanel" id="panel-timeline" aria-labelledby="tab-timeline">
          <TimelineSection
            activities={activities}
            jobId={job.id}
            onActivitiesChanged={fetchActivities}
          />
        </div>
      )}
      {activeTab === "interviews" && (
        <div role="tabpanel" id="panel-interviews" aria-labelledby="tab-interviews">
          <InterviewsSection
            activities={activities.filter((a) => a.type === "INTERVIEW")}
            jobId={job.id}
            onActivitiesChanged={fetchActivities}
          />
        </div>
      )}
      {activeTab === "followups" && (
        <div role="tabpanel" id="panel-followups" aria-labelledby="tab-followups">
          <FollowUpsSection
            activities={activities.filter((a) => a.type === "FOLLOWUP")}
            jobId={job.id}
            onActivitiesChanged={fetchActivities}
          />
        </div>
      )}
    </div>
  );
}
