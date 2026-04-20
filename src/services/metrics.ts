import { STAGE_PRISMA_TO_UI } from "@/constants/job-stages";
import { prisma } from "@/services/prisma";

export type DashboardMetrics = {
  stageCounts: Record<string, number>;
  totalJobs: number;
  activeApplications: number;
  responseRate: number;
  interviewRate: number;
  rejectionRate: number;
};

export async function getDashboardMetrics(userId: string): Promise<DashboardMetrics> {
  const jobs = await prisma.job.findMany({ where: { userId } });

  const stageCounts: Record<string, number> = {};
  for (const job of jobs) {
    const uiStage = STAGE_PRISMA_TO_UI[job.stage] ?? job.stage;
    stageCounts[uiStage] = (stageCounts[uiStage] ?? 0) + 1;
  }

  const activeApplications = jobs.filter(
    (j) => j.stage !== "REJECTED" && j.stage !== "ARCHIVED"
  ).length;

  const nonInterestedJobs = jobs.filter((j) => j.stage !== "INTERESTED");
  const nonInterestedCount = nonInterestedJobs.length;

  let responseRate = 0;
  if (nonInterestedCount > 0) {
    const stageHistories = await prisma.jobStageHistory.findMany({
      where: {
        jobId: { in: nonInterestedJobs.map((j) => j.id) },
        fromStage: "APPLIED",
        toStage: { not: "APPLIED" },
      },
    });
    const respondedJobIds = new Set(stageHistories.map((h) => h.jobId));
    responseRate = Math.round((respondedJobIds.size / nonInterestedCount) * 100);
  }

  const interviewCount = jobs.filter(
    (j) => j.stage === "INTERVIEW" || j.stage === "OFFER"
  ).length;
  const interviewRate =
    nonInterestedCount > 0 ? Math.round((interviewCount / nonInterestedCount) * 100) : 0;

  const rejectionCount = jobs.filter((j) => j.stage === "REJECTED").length;
  const rejectionRate =
    nonInterestedCount > 0 ? Math.round((rejectionCount / nonInterestedCount) * 100) : 0;

  return {
    stageCounts,
    totalJobs: jobs.length,
    activeApplications,
    responseRate,
    interviewRate,
    rejectionRate,
  };
}
