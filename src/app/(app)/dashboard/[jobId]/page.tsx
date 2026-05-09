"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { showToast } from "@/components/ui/toast";
import { STAGE_STYLES } from "@/constants/job-stages";
import type { JobActivity } from "@/types/activity";
import type { Job } from "@/types/job";
import { DocumentsSection } from "./documents-section";
import { FollowUpsSection } from "./followups-section";
import { InterviewsSection } from "./interviews-section";
import { OverviewSection } from "./overview-section";
import { PrepNotesSection } from "./prep-notes-section";
import { ResearchSection } from "./research-section";
import { TimelineSection } from "./timeline-section";

type Tab =
  | "overview"
  | "timeline"
  | "interviews"
  | "followups"
  | "documents"
  | "research"
  | "prepnotes";

export default function JobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const router = useRouter();
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [activities, setActivities] = useState<JobActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  useEffect(() => {
    let cancelled = false;
    params.then(({ jobId }) => {
      if (!cancelled) setJobId(jobId);
    });
    return () => {
      cancelled = true;
    };
  }, [params]);

  const fetchJob = useCallback(
    async (signal?: AbortSignal) => {
      if (!jobId) return;
      try {
        const res = await fetch(`/api/jobs/${jobId}`, { signal });
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (res.status === 404) {
          router.push("/dashboard");
          return;
        }
        if (!res.ok) throw new Error();
        if (!signal?.aborted) setJob(await res.json());
      } catch (err) {
        if (signal?.aborted || (err as Error)?.name === "AbortError") return;
        showToast("Failed to load job", "error");
      }
    },
    [jobId, router]
  );

  const fetchActivities = useCallback(
    async (signal?: AbortSignal) => {
      if (!jobId) return;
      try {
        const res = await fetch(`/api/jobs/${jobId}/activities`, { signal });
        if (!res.ok) throw new Error();
        if (!signal?.aborted) setActivities(await res.json());
      } catch (err) {
        if (signal?.aborted || (err as Error)?.name === "AbortError") return;
        showToast("Failed to load activities", "error");
      }
    },
    [jobId]
  );

  useEffect(() => {
    if (!jobId) return;
    setLoading(true);
    const ctrl = new AbortController();
    Promise.all([fetchJob(ctrl.signal), fetchActivities(ctrl.signal)]).finally(() => {
      if (!ctrl.signal.aborted) setLoading(false);
    });
    return () => ctrl.abort();
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
    { id: "documents", label: "Documents" },
    { id: "research", label: "Research" },
    { id: "prepnotes", label: "Prep Notes" },
  ];

  return (
    <div>
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center justify-center w-10 h-10 rounded-md text-indigo-400 hover:text-indigo-300 hover:bg-zinc-800 text-lg transition-colors mb-6"
        aria-label="Go back"
      >
        &larr;
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
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STAGE_STYLES[job.stage]?.badge ?? "bg-zinc-800 text-zinc-300"}`}
          >
            {job.stage}
          </span>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Job sections"
        className="flex gap-1 border-b border-zinc-800 mb-6 overflow-x-auto"
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
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
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
      {activeTab === "documents" && (
        <div role="tabpanel" id="panel-documents" aria-labelledby="tab-documents">
          <DocumentsSection job={job} />
        </div>
      )}
      {activeTab === "research" && (
        <div role="tabpanel" id="panel-research" aria-labelledby="tab-research">
          <ResearchSection job={job} onJobUpdated={(updated) => setJob(updated)} />
        </div>
      )}
      {activeTab === "prepnotes" && (
        <div role="tabpanel" id="panel-prepnotes" aria-labelledby="tab-prepnotes">
          <PrepNotesSection job={job} onJobUpdated={(updated) => setJob(updated)} />
        </div>
      )}
    </div>
  );
}
