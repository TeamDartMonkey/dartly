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

export async function getDashboardMetrics(userId: string): Promise<DashboardMetrics> {
  const jobs = await prisma.job.findMany({ where: { userId } });

  const stageCounts: Record<string, number> = {};
  for (const job of jobs) {
    const uiStage = STAGE_PRISMA_TO_UI[job.stage] ?? job.stage;
    stageCounts[uiStage] = (stageCounts[uiStage] ?? 0) + 1;
  }

  // Active applications: jobs still in play. Excludes terminal/withdrawn stages
  // (Rejected, Archived, Ghosted) so the count reflects genuine pipeline health.
  const activeApplications = jobs.filter(
    (j) => j.stage !== "REJECTED" && j.stage !== "ARCHIVED" && j.stage !== "GHOSTED"
  ).length;

  // All rates are computed against non-Interested jobs only.
  // "Interested" is a pre-application bookmark, not an actual submission.
  const nonInterestedJobs = jobs.filter((j) => j.stage !== "INTERESTED");
  const nonInterestedCount = nonInterestedJobs.length;

  // Response rate: percentage of applied jobs that received a real employer response.
  // Looks at stage transitions from APPLIED → any stage except APPLIED or GHOSTED.
  // Ghosted is excluded because "no response" is not a response — but ghosted jobs
  // still inflate the denominator, correctly dragging the rate down.
  const responseCount = jobs.filter(
    (j) => j.stage === "INTERVIEW" || j.stage === "OFFER" || j.stage === "REJECTED"
  ).length;
  const responseRate =
    nonInterestedCount > 0 ? Math.round((responseCount / nonInterestedCount) * 100) : 0;

  // Interview rate: jobs that reached at least Interview stage (or went further to Offer).
  // These are the strongest signal of employer interest.
  const interviewCount = jobs.filter(
    (j) => j.stage === "INTERVIEW" || j.stage === "OFFER"
  ).length;
  const interviewRate =
    nonInterestedCount > 0 ? Math.round((interviewCount / nonInterestedCount) * 100) : 0;

  // Rejection rate: straightforward — rejected jobs / non-Interested jobs.
  const rejectionCount = jobs.filter((j) => j.stage === "REJECTED").length;
  const rejectionRate =
    nonInterestedCount > 0 ? Math.round((rejectionCount / nonInterestedCount) * 100) : 0;

  // Ghost rate: jobs where the employer stopped responding, as a percentage
  // of all jobs the candidate actually applied to (non-Interested).
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
