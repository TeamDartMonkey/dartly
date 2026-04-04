import { prisma } from "@/services/prisma";
import type { ProfileData } from "@/types/profile";

function toProfileData(profile: {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  professionalLinks: unknown;
  headline: string | null;
  summary: string | null;
  targetRoles: string[];
  targetLocations: string[];
  workModePreference: string | null;
  salaryPreference: number | null;
}): ProfileData {
  return {
    firstName: profile.firstName ?? undefined,
    lastName: profile.lastName ?? undefined,
    email: profile.email ?? undefined,
    phone: profile.phone ?? undefined,
    location: profile.location ?? undefined,
    professionalLinks: (profile.professionalLinks as Record<string, string>) ?? undefined,
    headline: profile.headline ?? undefined,
    summary: profile.summary ?? undefined,
    targetRoles: profile.targetRoles,
    targetLocations: profile.targetLocations,
    workModePreference: profile.workModePreference ?? undefined,
    salaryPreference: profile.salaryPreference ?? undefined,
    experiences: [],
    educations: [],
    skills: [],
  };
}

function buildUpdateFields(data: Partial<ProfileData>): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  if (data.firstName !== undefined) fields.firstName = data.firstName ?? null;
  if (data.lastName !== undefined) fields.lastName = data.lastName ?? null;
  if (data.email !== undefined) fields.email = data.email ?? null;
  if (data.phone !== undefined) fields.phone = data.phone ?? null;
  if (data.location !== undefined) fields.location = data.location ?? null;
  if (data.headline !== undefined) fields.headline = data.headline ?? null;
  if (data.summary !== undefined) fields.summary = data.summary ?? null;
  if (data.targetRoles !== undefined) fields.targetRoles = data.targetRoles;
  if (data.targetLocations !== undefined) fields.targetLocations = data.targetLocations;
  if (data.workModePreference !== undefined)
    fields.workModePreference = data.workModePreference ?? null;
  if (data.salaryPreference !== undefined) fields.salaryPreference = data.salaryPreference ?? null;
  if (data.professionalLinks !== undefined)
    fields.professionalLinks = data.professionalLinks ?? null;
  return fields;
}

export async function getProfile(userId: string): Promise<ProfileData | null> {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) return null;
  return toProfileData(profile);
}

export async function upsertProfile(
  userId: string,
  data: Partial<ProfileData>
): Promise<ProfileData> {
  const fields = buildUpdateFields(data);

  const profile = await prisma.profile.upsert({
    where: { userId },
    create: {
      userId,
      targetRoles: [],
      targetLocations: [],
      ...fields,
    },
    update: fields,
  });

  return toProfileData(profile);
}
