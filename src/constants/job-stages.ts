import type { JobStage } from "@/types/job";

export const STAGE_UI_TO_PRISMA: Record<JobStage, string> = {
  Interested: "INTERESTED",
  Applied: "APPLIED",
  Interview: "INTERVIEW",
  Offer: "OFFER",
  Rejected: "REJECTED",
  Ghosted: "GHOSTED",
  Archived: "ARCHIVED",
};

export const STAGE_PRISMA_TO_UI: Record<string, JobStage> = {
  INTERESTED: "Interested",
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
  GHOSTED: "Ghosted",
  ARCHIVED: "Archived",
};

export const STAGES: JobStage[] = [
  "Interested",
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
  "Ghosted",
  "Archived",
];

export const ACTIVE_STAGES: JobStage[] = STAGES.filter((s) => s !== "Archived" && s !== "Ghosted");

type StageStyle = {
  badge: string;
  dot: string;
  text: string;
};

export const STAGE_STYLES: Record<JobStage, StageStyle> = {
  Interested: {
    badge: "bg-zinc-800 text-zinc-400 border-zinc-700",
    dot: "bg-zinc-400",
    text: "text-zinc-400",
  },
  Applied: {
    badge: "bg-blue-950 text-blue-400 border-blue-800",
    dot: "bg-blue-400",
    text: "text-blue-400",
  },
  Interview: {
    badge: "bg-yellow-950 text-yellow-400 border-yellow-800",
    dot: "bg-yellow-400",
    text: "text-yellow-400",
  },
  Offer: {
    badge: "bg-green-950 text-green-400 border-green-800",
    dot: "bg-green-400",
    text: "text-green-400",
  },
  Rejected: {
    badge: "bg-red-950 text-red-400 border-red-800",
    dot: "bg-red-400",
    text: "text-red-400",
  },
  Ghosted: {
    badge: "bg-purple-950 text-purple-400 border-purple-800",
    dot: "bg-purple-400",
    text: "text-purple-400",
  },
  Archived: {
    badge: "bg-orange-950 text-orange-400 border-orange-800",
    dot: "bg-orange-400",
    text: "text-orange-400",
  },
};

export const STAGE_TEXT_STYLES: Record<JobStage, string> = Object.fromEntries(
  Object.entries(STAGE_STYLES).map(([stage, style]) => [stage, style.text])
) as Record<JobStage, string>;
