import { z } from "zod/v4";

const IsoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD")
  .or(z.literal(""));

export const ExperienceSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["EMPLOYMENT", "PROJECT"]),
  title: z.string().trim().min(1).max(200),
  organization: z.string().trim().max(200),
  location: z.string().trim().max(200).optional(),
  startDate: IsoDateString,
  endDate: IsoDateString.optional(),
  isCurrent: z.boolean(),
  description: z.string().max(5000),
});

export const EducationSchema = z.object({
  id: z.string().optional(),
  institution: z.string().trim().min(1).max(200),
  degree: z.string().trim().max(200),
  fieldOfStudy: z.string().trim().max(200),
  startDate: IsoDateString,
  endDate: IsoDateString,
  gpa: z.string().trim().max(10),
});

export const SkillSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(100),
  category: z.string().trim().max(100).optional(),
  proficiency: z.string().trim().max(50).optional(),
});

const NullableString = z.string().trim().max(200).nullish();

export const ProfilePatchSchema = z
  .object({
    firstName: NullableString,
    lastName: NullableString,
    email: z.email().nullish(),
    phone: z.string().trim().max(50).nullish(),
    location: NullableString,
    headline: NullableString,
    summary: z.string().trim().max(5000).nullish(),
    targetRoles: z.array(z.string().trim().max(100)).max(50),
    targetLocations: z.array(z.string().trim().max(100)).max(50),
    workModePreference: z.enum(["Remote", "Hybrid", "On-site", "Flexible"]).nullish(),
    salaryPreference: z.number().int().min(0).max(10_000_000).nullish(),
    professionalLinks: z.record(z.string(), z.url().or(z.literal(""))).nullish(),
    experiences: z.array(ExperienceSchema).max(50),
    educations: z.array(EducationSchema).max(50),
    skills: z.array(SkillSchema).max(200),
  })
  .partial();
