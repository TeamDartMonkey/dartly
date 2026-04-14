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

export const STAGES: JobStage[] = [
  "Interested",
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
  "Archived",
];

export const STAGE_TEXT_STYLES: Record<JobStage, string> = {
  Interested: "text-zinc-400",
  Applied: "text-blue-400",
  Interview: "text-yellow-400",
  Offer: "text-green-400",
  Rejected: "text-red-400",
  Archived: "text-zinc-500",
};
