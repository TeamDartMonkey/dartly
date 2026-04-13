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
  location: z.string().trim().max(200),
  description: z.string().trim().max(5000).or(z.null()).optional(),
  compensationNotes: z.string().trim().max(1000).or(z.null()).optional(),
  applicationDate: z.string().date().or(z.null()).optional(),
  deadline: z.string().date().or(z.null()).optional(),
  recruiterNotes: z.string().trim().max(1000).or(z.null()).optional(),
  customNotes: z.string().trim().max(5000).or(z.null()).optional(),
  stage: JobStageSchema.optional(),
  priority: z.boolean().optional(),
  customNotes: z.string().trim().max(2000).optional(),
});

export const UpdateJobSchema = CreateJobSchema.partial();
