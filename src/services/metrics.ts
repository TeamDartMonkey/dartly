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
  weeklyCounts: number[]; // length 4, oldest → newest week
  weekStartIsos: string[]; // length 4, ISO date strings of each bucket start
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
  const jobs = await prisma.job.findMany({ where: { userId } });

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
  const jobs = await prisma.job.findMany({ where: { userId } });
  const jobIds = jobs.map((j) => j.id);
  const history =
    jobIds.length > 0
      ? await prisma.jobStageHistory.findMany({ where: { jobId: { in: jobIds } } })
      : [];

  return {
    velocity: computeVelocity(jobs),
    funnel: computeFunnel(jobs, history),
    timeInStage: computeTimeInStage(history),
  };
}

function computeVelocity(jobs: { applicationDate: Date | null }[]): VelocityMetrics {
  const now = Date.now();
  const cutoff30 = now - 30 * DAY_MS;
  const cutoff60 = now - 60 * DAY_MS;

  let last30 = 0;
  let prior30 = 0;
  for (const job of jobs) {
    if (!job.applicationDate) continue;
    const t = job.applicationDate.getTime();
    if (t >= cutoff30 && t <= now) last30 += 1;
    else if (t >= cutoff60 && t < cutoff30) prior30 += 1;
  }
  const changePercent = prior30 > 0 ? Math.round(((last30 - prior30) / prior30) * 100) : 0;

  // 4 weekly buckets, oldest → newest. Each bucket is 7 days.
  const weeklyCounts = [0, 0, 0, 0];
  const weekStartIsos: string[] = [];
  for (let i = 0; i < 4; i++) {
    // i=0 → oldest (28-21d ago), i=3 → newest (7-0d ago)
    const start = now - (4 - i) * 7 * DAY_MS;
    weekStartIsos.push(new Date(start).toISOString());
  }
  for (const job of jobs) {
    if (!job.applicationDate) continue;
    const t = job.applicationDate.getTime();
    const daysAgo = Math.floor((now - t) / DAY_MS);
    if (daysAgo < 0 || daysAgo >= 28) continue;
    const bucket = 3 - Math.floor(daysAgo / 7);
    weeklyCounts[bucket] += 1;
  }

  return { last30Days: last30, prior30Days: prior30, changePercent, weeklyCounts, weekStartIsos };
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
  history: { jobId: string; toStage: string; changedAt: Date }[]
): Partial<Record<string, number>> {
  const byJob = new Map<string, { toStage: string; changedAt: Date }[]>();
  for (const h of history) {
    const arr = byJob.get(h.jobId) ?? [];
    arr.push(h);
    byJob.set(h.jobId, arr);
  }

  const sums: Record<string, { totalDays: number; count: number }> = {};
  for (const events of byJob.values()) {
    events.sort((a, b) => a.changedAt.getTime() - b.changedAt.getTime());
    for (let i = 0; i < events.length - 1; i++) {
      const stage = events[i].toStage;
      const days = (events[i + 1].changedAt.getTime() - events[i].changedAt.getTime()) / DAY_MS;
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
