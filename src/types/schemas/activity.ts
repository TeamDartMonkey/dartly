import { z } from "zod/v4";

export const ActivityTypeSchema = z.enum([
  "INTERVIEW",
  "FOLLOWUP",
  "NOTE",
  "STAGE",
  "APPLIED",
  "OUTCOME",
]);

// POST /api/jobs/[id]/activities
export const CreateActivitySchema = z.object({
  type: ActivityTypeSchema,
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  scheduledAt: z.string().datetime({ offset: true }).optional(),
  roundType: z.string().optional(),
  completed: z.boolean().optional(),
});

// PUT /api/jobs/[id]/activities/[activityId]
export const UpdateActivitySchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  scheduledAt: z.string().datetime({ offset: true }).optional().nullable(),
  roundType: z.string().optional().nullable(),
  completed: z.boolean().optional(),
});

export type CreateActivityInput = z.infer<typeof CreateActivitySchema>;
export type UpdateActivityInput = z.infer<typeof UpdateActivitySchema>;