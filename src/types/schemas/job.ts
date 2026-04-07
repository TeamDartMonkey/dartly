import { z } from "zod/v4";

export const JobStageSchema = z.enum([
  "Interested",
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
  "Archived",
]);

export const CreateJobSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  company: z.string().trim().min(1, "Company is required").max(200),
  location: z.string().trim().max(200).optional(),
  stage: JobStageSchema.optional(),
  priority: z.boolean().optional(),
});

export const UpdateJobSchema = CreateJobSchema.partial();
