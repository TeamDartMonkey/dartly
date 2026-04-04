import type { JobStage } from "@/types/job";

export const STAGE_UI_TO_PRISMA: Record<JobStage, string> = {
  Interested: "INTERESTED",
  Applied: "APPLIED",
  Interview: "INTERVIEW",
  Offer: "OFFER",
  Rejected: "REJECTED",
  Archived: "ARCHIVED",
};

export const STAGE_PRISMA_TO_UI: Record<string, JobStage> = {
  INTERESTED: "Interested",
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
  ARCHIVED: "Archived",
};
