import { STAGE_PRISMA_TO_UI } from "@/constants/job-stages";
import { prisma } from "@/services/prisma";

export type DashboardMetrics = {
  stageCounts: Record<string, number>;
  totalJobs: number;
  responseRate: number;
  averageTimeToResponse: number | null;
  activeApplications: number;
};

export async function getDashboardMetrics(userId: string): Promise<DashboardMetrics> {
  const jobs = await prisma.job.findMany({ where: { userId } });

  // Stage counts (using UI labels)
  const stageCounts: Record<string, number> = {};
  for (const job of jobs) {
    const uiStage = STAGE_PRISMA_TO_UI[job.stage] ?? job.stage;
    stageCounts[uiStage] = (stageCounts[uiStage] ?? 0) + 1;
  }

  // Active applications: not Rejected or Archived
  const activeApplications = jobs.filter(
    (j) => j.stage !== "REJECTED" && j.stage !== "ARCHIVED"
  ).length;

  // Response rate: % of APPLIED jobs that progressed past APPLIED
  const appliedJobIds = jobs.filter((j) => j.stage !== "INTERESTED").map((j) => j.id);

  let responseRate = 0;
  let averageTimeToResponse: number | null = null;

  if (appliedJobIds.length > 0) {
    // Find jobs that have stage history showing movement from APPLIED to another stage
    const stageHistories = await prisma.jobStageHistory.findMany({
      where: {
        jobId: { in: appliedJobIds },
        fromStage: "APPLIED",
        toStage: { not: "APPLIED" },
      },
      orderBy: { changedAt: "asc" },
    });

    // Get the set of jobs that had a response (moved past APPLIED)
    const respondedJobIds = new Set(stageHistories.map((h) => h.jobId));
    responseRate =
      appliedJobIds.length > 0
        ? Math.round((respondedJobIds.size / appliedJobIds.length) * 100)
        : 0;

    // Average time to response: days from APPLIED entry to next stage
    if (stageHistories.length > 0) {
      const appliedEntries = await prisma.jobStageHistory.findMany({
        where: {
          jobId: { in: Array.from(respondedJobIds) },
          toStage: "APPLIED",
        },
        orderBy: { changedAt: "asc" },
      });

      const appliedDateByJob = new Map<string, Date>();
      for (const entry of appliedEntries) {
        if (!appliedDateByJob.has(entry.jobId)) {
          appliedDateByJob.set(entry.jobId, entry.changedAt);
        }
      }

      let totalDays = 0;
      let count = 0;

      // Use the earliest response for each job
      const firstResponseByJob = new Map<string, Date>();
      for (const h of stageHistories) {
        if (!firstResponseByJob.has(h.jobId)) {
          firstResponseByJob.set(h.jobId, h.changedAt);
        }
      }

      for (const [jobId, responseDate] of firstResponseByJob) {
        const appliedDate = appliedDateByJob.get(jobId);
        if (appliedDate) {
          const diffMs = responseDate.getTime() - appliedDate.getTime();
          totalDays += diffMs / (1000 * 60 * 60 * 24);
          count++;
        }
      }

      averageTimeToResponse = count > 0 ? Math.round((totalDays / count) * 10) / 10 : null;
    }
  }

  return {
    stageCounts,
    totalJobs: jobs.length,
    responseRate,
    averageTimeToResponse,
    activeApplications,
  };
}
