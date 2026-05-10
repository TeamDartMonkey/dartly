import { STAGE_PRISMA_TO_UI } from "@/constants/job-stages";
import { prisma } from "@/services/prisma";

export type DashboardMetrics = {
  stageCounts: Record<string, number>;
  totalJobs: number;
  activeApplications: number;
  responseRate: number;
  interviewRate: number;
  rejectionRate: number;
  ghostRate: number;
  offerCount: number;
};

export type VelocityMetrics = {
  last30Days: number;
  prior30Days: number;
  changePercent: number;
  // Daily buckets covering the last 30 days, oldest (29 days ago) → newest
  // (today). Each entry is the count of applicationDates that fell within
  // that calendar day in the user's local-equivalent UTC frame. Using daily
  // granularity gives the chart enough resolution to show a real trend.
  dailyCounts: number[]; // length 30
  dayStartIsos: string[]; // length 30
};

export type FunnelMetrics = {
  reachedInterested: number;
  reachedApplied: number;
  reachedInterview: number;
  reachedOffer: number;
  appliedRate: number;
  interviewRate: number;
  offerRate: number;
};

export type AnalyticsBreakdown = {
  velocity: VelocityMetrics;
  funnel: FunnelMetrics;
  timeInStage: Partial<Record<string, number>>;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const FUNNEL_RANK: Record<string, number> = {
  INTERESTED: 0,
  APPLIED: 1,
  INTERVIEW: 2,
  OFFER: 3,
};

export async function getDashboardMetrics(userId: string): Promise<DashboardMetrics> {
  // Select only the columns we use; description, recruiterNotes, etc. can be
  // many KB each and are not needed for stage aggregation.
  const jobs = await prisma.job.findMany({
    where: { userId },
    select: { id: true, stage: true, applicationDate: true },
  });

  const stageCounts: Record<string, number> = {};
  for (const job of jobs) {
    const uiStage = STAGE_PRISMA_TO_UI[job.stage] ?? job.stage;
    stageCounts[uiStage] = (stageCounts[uiStage] ?? 0) + 1;
  }

  const activeApplications = jobs.filter(
    (j) => j.stage !== "REJECTED" && j.stage !== "ARCHIVED" && j.stage !== "GHOSTED"
  ).length;

  const nonInterestedJobs = jobs.filter((j) => j.stage !== "INTERESTED");
  const nonInterestedCount = nonInterestedJobs.length;

  const responseCount = jobs.filter(
    (j) => j.stage === "INTERVIEW" || j.stage === "OFFER" || j.stage === "REJECTED"
  ).length;
  const responseRate =
    nonInterestedCount > 0 ? Math.round((responseCount / nonInterestedCount) * 100) : 0;

  const interviewCount = jobs.filter((j) => j.stage === "INTERVIEW" || j.stage === "OFFER").length;
  const interviewRate =
    nonInterestedCount > 0 ? Math.round((interviewCount / nonInterestedCount) * 100) : 0;

  const rejectionCount = jobs.filter((j) => j.stage === "REJECTED").length;
  const rejectionRate =
    nonInterestedCount > 0 ? Math.round((rejectionCount / nonInterestedCount) * 100) : 0;

  const ghostCount = jobs.filter((j) => j.stage === "GHOSTED").length;
  const ghostRate =
    nonInterestedCount > 0 ? Math.round((ghostCount / nonInterestedCount) * 100) : 0;

  const offerCount = jobs.filter((j) => j.stage === "OFFER").length;

  return {
    stageCounts,
    totalJobs: jobs.length,
    activeApplications,
    responseRate,
    interviewRate,
    rejectionRate,
    ghostRate,
    offerCount,
  };
}

export async function getAnalyticsBreakdown(userId: string): Promise<AnalyticsBreakdown> {
  const jobs = await prisma.job.findMany({
    where: { userId },
    select: { id: true, stage: true, applicationDate: true },
  });
  const jobIds = jobs.map((j) => j.id);
  const history =
    jobIds.length > 0
      ? await prisma.jobStageHistory.findMany({
          where: { jobId: { in: jobIds } },
          select: { jobId: true, toStage: true, changedAt: true },
        })
      : [];

  return {
    velocity: computeVelocity(jobs),
    funnel: computeFunnel(jobs, history),
    // Pass current jobs so computeTimeInStage can include time-in-current-stage
    // (the most recent transition until now), not just time between past
    // transitions.
    timeInStage: computeTimeInStage(history, jobs),
  };
}

const VELOCITY_WINDOW_DAYS = 30;

// Floor a millisecond timestamp to its UTC calendar-day epoch ms. Using UTC
// (instead of locale time) keeps server-side bucketing deterministic across
// runtime timezones — Vercel runs UTC, dev machines may not.
function utcDayStart(ms: number): number {
  return Math.floor(ms / DAY_MS) * DAY_MS;
}

function computeVelocity(jobs: { applicationDate: Date | null }[]): VelocityMetrics {
  const now = Date.now();
  const cutoff30 = now - VELOCITY_WINDOW_DAYS * DAY_MS;
  const cutoff60 = now - 2 * VELOCITY_WINDOW_DAYS * DAY_MS;

  let last30 = 0;
  let prior30 = 0;
  for (const job of jobs) {
    if (!job.applicationDate) continue;
    const t = job.applicationDate.getTime();
    if (t >= cutoff30 && t <= now) last30 += 1;
    else if (t >= cutoff60 && t < cutoff30) prior30 += 1;
  }
  const changePercent = prior30 > 0 ? Math.round(((last30 - prior30) / prior30) * 100) : 0;

  // 30 daily buckets keyed by UTC calendar day. Bucket 0 is the start of
  // (today − 29 days); bucket 29 is the start of today. Two timestamps on
  // the same UTC day always land in the same bucket — important so a
  // 9 AM and 6 PM application both count as "today".
  const todayStart = utcDayStart(now);
  const oldestStart = todayStart - (VELOCITY_WINDOW_DAYS - 1) * DAY_MS;

  const dailyCounts = new Array<number>(VELOCITY_WINDOW_DAYS).fill(0);
  const dayStartIsos = new Array<string>(VELOCITY_WINDOW_DAYS);
  for (let i = 0; i < VELOCITY_WINDOW_DAYS; i++) {
    dayStartIsos[i] = new Date(oldestStart + i * DAY_MS).toISOString();
  }
  for (const job of jobs) {
    if (!job.applicationDate) continue;
    const dayStart = utcDayStart(job.applicationDate.getTime());
    const offset = Math.round((dayStart - oldestStart) / DAY_MS);
    if (offset < 0 || offset >= VELOCITY_WINDOW_DAYS) continue;
    dailyCounts[offset] += 1;
  }

  return { last30Days: last30, prior30Days: prior30, changePercent, dailyCounts, dayStartIsos };
}

function computeFunnel(
  jobs: { id: string; stage: string }[],
  history: { jobId: string; toStage: string }[]
): FunnelMetrics {
  const maxRankByJob = new Map<string, number>();
  for (const job of jobs) {
    const currentRank = FUNNEL_RANK[job.stage] ?? -1;
    maxRankByJob.set(job.id, currentRank);
  }
  for (const h of history) {
    const rank = FUNNEL_RANK[h.toStage];
    if (rank === undefined) continue; // terminal stage, skip
    const prev = maxRankByJob.get(h.jobId) ?? -1;
    if (rank > prev) maxRankByJob.set(h.jobId, rank);
  }

  const reachedInterested = jobs.length;
  let reachedApplied = 0;
  let reachedInterview = 0;
  let reachedOffer = 0;
  for (const rank of maxRankByJob.values()) {
    if (rank >= 1) reachedApplied += 1;
    if (rank >= 2) reachedInterview += 1;
    if (rank >= 3) reachedOffer += 1;
  }

  return {
    reachedInterested,
    reachedApplied,
    reachedInterview,
    reachedOffer,
    appliedRate: reachedInterested > 0 ? Math.round((reachedApplied / reachedInterested) * 100) : 0,
    interviewRate: reachedApplied > 0 ? Math.round((reachedInterview / reachedApplied) * 100) : 0,
    offerRate: reachedInterview > 0 ? Math.round((reachedOffer / reachedInterview) * 100) : 0,
  };
}

function computeTimeInStage(
  history: { jobId: string; toStage: string; changedAt: Date }[],
  jobs: { id: string; stage: string }[] = []
): Partial<Record<string, number>> {
  type StageEvent = { toStage: string; changedAt: Date };
  const byJob = new Map<string, StageEvent[]>();
  for (const h of history) {
    const arr = byJob.get(h.jobId) ?? [];
    arr.push({ toStage: h.toStage, changedAt: h.changedAt });
    byJob.set(h.jobId, arr);
  }

  // Append a synthetic "now" transition for each job so the time spent in the
  // current stage is included in the average. Without this, the metric
  // systematically under-reports active stages (a job that has been in
  // INTERVIEW for 60 days with no further transitions contributes 0).
  const now = new Date();
  for (const job of jobs) {
    const events = byJob.get(job.id);
    if (!events || events.length === 0) continue;
    events.push({ toStage: job.stage, changedAt: now });
  }

  const sums: Record<string, { totalDays: number; count: number }> = {};
  for (const events of byJob.values()) {
    // Don't mutate the caller's array.
    const sorted = [...events].sort((a, b) => a.changedAt.getTime() - b.changedAt.getTime());
    for (let i = 0; i < sorted.length - 1; i++) {
      const stage = sorted[i].toStage;
      const days = (sorted[i + 1].changedAt.getTime() - sorted[i].changedAt.getTime()) / DAY_MS;
      const bucket = sums[stage] ?? { totalDays: 0, count: 0 };
      bucket.totalDays += days;
      bucket.count += 1;
      sums[stage] = bucket;
    }
  }

  const result: Partial<Record<string, number>> = {};
  for (const [stage, { totalDays, count }] of Object.entries(sums)) {
    result[stage] = Math.round(totalDays / count);
  }
  return result;
}
