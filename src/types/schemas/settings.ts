import { z } from "zod/v4";

export const DEFAULT_JOB_STAGES = ["INTERESTED", "APPLIED", "INTERVIEW", "OFFER"] as const;

export const UserPreferencesSchema = z.object({
  defaultJobStage: z.enum(DEFAULT_JOB_STAGES).optional(),
  showArchived: z.boolean().optional(),
  dashboardView: z.enum(["card", "list"]).optional(),
  autoArchiveRejected: z.boolean().optional(),
  autoArchiveRejectedDays: z.number().int().min(1).max(365).optional(),
});

export type UserPreferencesInput = z.infer<typeof UserPreferencesSchema>;
