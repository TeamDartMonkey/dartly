import { prisma } from "@/services/prisma";
import type { Education, Experience, ProfileData, Skill } from "@/types/profile";

type DbExperience = {
  id: string;
  type: "EMPLOYMENT" | "PROJECT";
  title: string;
  organization: string | null;
  startDate: Date | null;
  endDate: Date | null;
  isCurrent: boolean;
  description: string | null;
};

type DbEducation = {
  id: string;
  institution: string;
  degree: string | null;
  fieldOfStudy: string | null;
  startDate: Date | null;
  endDate: Date | null;
  gpa: string | null;
};

type DbSkill = {
  id: string;
  name: string;
};

function toIsoDate(d: Date | null): string | undefined {
  return d ? d.toISOString().slice(0, 10) : undefined;
}

function fromIsoDate(s: string | undefined | null): Date | null {
  if (!s) return null;
  return new Date(`${s}T00:00:00.000Z`);
}

function mapExperience(e: DbExperience): Experience {
  return {
    id: e.id,
    type: e.type,
    title: e.title,
    organization: e.organization ?? undefined,
    startDate: toIsoDate(e.startDate),
    endDate: toIsoDate(e.endDate),
    isCurrent: e.isCurrent,
    description: e.description ?? undefined,
  };
}

function mapEducation(e: DbEducation): Education {
  return {
    id: e.id,
    institution: e.institution,
    degree: e.degree ?? undefined,
    fieldOfStudy: e.fieldOfStudy ?? undefined,
    startDate: toIsoDate(e.startDate),
    endDate: toIsoDate(e.endDate),
    gpa: e.gpa ?? undefined,
  };
}

function mapSkill(s: DbSkill): Skill {
  return {
    id: s.id,
    name: s.name,
  };
}

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
  experiences?: DbExperience[];
  educations?: DbEducation[];
  skills?: DbSkill[];
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
    experiences: (profile.experiences ?? []).map(mapExperience),
    educations: (profile.educations ?? []).map(mapEducation),
    skills: (profile.skills ?? []).map(mapSkill),
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
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      experiences: {
        orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
      },
      educations: {
        orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
      },
      skills: { orderBy: { name: "asc" } },
    },
  });
  if (!profile) return null;
  return toProfileData(profile);
}

export async function upsertProfile(
  userId: string,
  data: Partial<ProfileData>
): Promise<ProfileData> {
  const fields = buildUpdateFields(data);

  return await prisma.$transaction(async (tx) => {
    const profile = await tx.profile.upsert({
      where: { userId },
      create: {
        userId,
        targetRoles: [],
        targetLocations: [],
        ...fields,
      },
      update: fields,
    });

    if (data.experiences !== undefined) {
      await tx.experience.deleteMany({ where: { profileId: profile.id } });
      if (data.experiences.length > 0) {
        await tx.experience.createMany({
          data: data.experiences.map((e) => ({
            profileId: profile.id,
            type: e.type,
            title: e.title,
            organization: e.organization ?? null,
            startDate: fromIsoDate(e.startDate),
            endDate: e.isCurrent ? null : fromIsoDate(e.endDate),
            isCurrent: e.isCurrent,
            description: e.description ?? null,
          })),
        });
      }
    }

    if (data.educations !== undefined) {
      await tx.education.deleteMany({ where: { profileId: profile.id } });
      if (data.educations.length > 0) {
        await tx.education.createMany({
          data: data.educations.map((e) => ({
            profileId: profile.id,
            institution: e.institution,
            degree: e.degree ?? null,
            fieldOfStudy: e.fieldOfStudy ?? null,
            startDate: fromIsoDate(e.startDate),
            endDate: fromIsoDate(e.endDate),
            gpa: e.gpa ?? null,
          })),
        });
      }
    }

    if (data.skills !== undefined) {
      await tx.skill.deleteMany({ where: { profileId: profile.id } });
      if (data.skills.length > 0) {
        await tx.skill.createMany({
          data: data.skills.map((s) => ({
            profileId: profile.id,
            name: s.name,
          })),
        });
      }
    }

    const fresh = await tx.profile.findUnique({
      where: { id: profile.id },
      include: { experiences: true, educations: true, skills: true },
    });

    if (!fresh) throw new Error("Profile not found after upsert");
    return toProfileData(fresh);
  });
}
