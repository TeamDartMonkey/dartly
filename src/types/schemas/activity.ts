import { z } from "zod/v4";

export const ActivityTypeSchema = z.enum(["INTERVIEW", "FOLLOWUP", "NOTE", "STAGE", "APPLIED"]);

// POST /api/jobs/[id]/activities
export const CreateActivitySchema = z.object({
  type: ActivityTypeSchema,
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(5000).optional(),
  scheduledAt: z.string().datetime({ offset: true }).optional(),
  roundType: z.string().trim().max(50).optional(),
  completed: z.boolean().optional(),
});

// PUT /api/jobs/[id]/activities/[activityId]
export const UpdateActivitySchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(5000).optional().nullable(),
  scheduledAt: z.string().datetime({ offset: true }).optional().nullable(),
  roundType: z.string().trim().max(50).optional().nullable(),
  completed: z.boolean().optional(),
});

export type CreateActivityInput = z.infer<typeof CreateActivitySchema>;
export type UpdateActivityInput = z.infer<typeof UpdateActivitySchema>;
