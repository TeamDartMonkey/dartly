import type { Prisma } from "@prisma/client";
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
  order: number;
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
  category: string | null;
  proficiency: string | null;
  order: number;
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
    organization: e.organization ?? "",
    startDate: toIsoDate(e.startDate) ?? "",
    endDate: toIsoDate(e.endDate),
    isCurrent: e.isCurrent,
    description: e.description ?? "",
  };
}

function mapEducation(e: DbEducation): Education {
  return {
    id: e.id,
    institution: e.institution,
    degree: e.degree ?? "",
    fieldOfStudy: e.fieldOfStudy ?? "",
    startDate: toIsoDate(e.startDate) ?? "",
    endDate: toIsoDate(e.endDate) ?? "",
    gpa: e.gpa ?? "",
  };
}

function mapSkill(s: DbSkill): Skill {
  return {
    id: s.id,
    name: s.name,
    category: s.category ?? "",
    proficiency: s.proficiency ?? "",
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
    professionalLinks:
      (profile.professionalLinks as Record<string, string> | undefined) ?? undefined,
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

type ProfilePatchInput = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  headline?: string | null;
  summary?: string | null;
  targetRoles?: string[];
  targetLocations?: string[];
  workModePreference?: string | null;
  salaryPreference?: number | null;
  professionalLinks?: Record<string, string> | null;
  experiences?: Experience[];
  educations?: Education[];
  skills?: Skill[];
};

function buildUpdateFields(data: ProfilePatchInput): Record<string, unknown> {
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
  if (data.workModePreference !== undefined) {
    fields.workModePreference = data.workModePreference ?? null;
  }
  if (data.salaryPreference !== undefined) {
    fields.salaryPreference = data.salaryPreference ?? null;
  }
  if (data.professionalLinks !== undefined) {
    fields.professionalLinks = data.professionalLinks ?? null;
  }

  return fields;
}

export async function getProfile(userId: string): Promise<ProfileData | null> {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      experiences: {
        orderBy: { order: "asc" },
      },
      educations: {
        orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
      },
      skills: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!profile) return null;
  return toProfileData(profile);
}

async function syncExperiences(
  tx: Prisma.TransactionClient,
  profileId: string,
  incoming: Experience[]
) {
  const existing = await tx.experience.findMany({
    where: { profileId },
    select: { id: true },
  });

  const existingIds = new Set(existing.map((e) => e.id));
  const incomingIds = new Set(incoming.flatMap((e) => (e.id ? [e.id] : [])));

  const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));
  if (toDelete.length > 0) {
    await tx.experience.deleteMany({ where: { id: { in: toDelete } } });
  }

  for (let index = 0; index < incoming.length; index++) {
    const e = incoming[index];

    const data = {
      profileId,
      type: e.type,
      title: e.title,
      organization: e.organization || null,
      startDate: fromIsoDate(e.startDate),
      endDate: e.isCurrent ? null : fromIsoDate(e.endDate),
      isCurrent: e.isCurrent,
      description: e.description || null,
      order: index,
    };

    if (e.id && existingIds.has(e.id)) {
      await tx.experience.update({
        where: { id: e.id },
        data,
      });
    } else {
      await tx.experience.create({
        data,
      });
    }
  }
}

async function syncEducations(
  tx: Prisma.TransactionClient,
  profileId: string,
  incoming: Education[]
) {
  const existing = await tx.education.findMany({
    where: { profileId },
    select: { id: true },
  });

  const existingIds = new Set(existing.map((e) => e.id));
  const incomingIds = new Set(incoming.flatMap((e) => (e.id ? [e.id] : [])));

  const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));
  if (toDelete.length > 0) {
    await tx.education.deleteMany({ where: { id: { in: toDelete } } });
  }

  for (const e of incoming) {
    const data = {
      profileId,
      institution: e.institution,
      degree: e.degree || null,
      fieldOfStudy: e.fieldOfStudy || null,
      startDate: fromIsoDate(e.startDate),
      endDate: fromIsoDate(e.endDate),
      gpa: e.gpa || null,
    };

    if (e.id && existingIds.has(e.id)) {
      await tx.education.update({
        where: { id: e.id },
        data,
      });
    } else {
      await tx.education.create({
        data,
      });
    }
  }
}

async function syncSkills(
  tx: Prisma.TransactionClient,
  profileId: string,
  incoming: Skill[]
) {
  const existing = await tx.skill.findMany({
    where: { profileId },
    select: { id: true },
  });

  const existingIds = new Set(existing.map((s) => s.id));
  const incomingIds = new Set(incoming.flatMap((s) => (s.id ? [s.id] : [])));

  const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));
  if (toDelete.length > 0) {
    await tx.skill.deleteMany({ where: { id: { in: toDelete } } });
  }

  for (let index = 0; index < incoming.length; index++) {
    const s = incoming[index];

    const data: {
      profileId: string;
      name: string;
      category?: string | null;
      proficiency?: string | null;
      order?: number;
    } = {
      profileId,
      name: s.name,
    };

    if (s.category !== undefined) {
      data.category = s.category || null;
    }

    if (s.proficiency !== undefined) {
      data.proficiency = s.proficiency || null;
    }

    if (incoming.length > 1) {
      data.order = index;
    }

    if (s.id && existingIds.has(s.id)) {
      await tx.skill.update({
        where: { id: s.id },
        data,
      });
    } else {
      await tx.skill.create({
        data: {
          ...data,
          order: index,
          category: s.category || null,
          proficiency: s.proficiency || null,
        },
      });
    }
  }
}

export async function upsertProfile(
  userId: string,
  data: ProfilePatchInput
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
      await syncExperiences(tx, profile.id, data.experiences);
    }

    if (data.educations !== undefined) {
      await syncEducations(tx, profile.id, data.educations);
    }

    if (data.skills !== undefined) {
      await syncSkills(tx, profile.id, data.skills);
    }

    const fresh = await tx.profile.findUnique({
      where: { id: profile.id },
      include: {
        experiences: {
          orderBy: { order: "asc" },
        },
        educations: true,
        skills: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!fresh) throw new Error("Profile not found after upsert");
    return toProfileData(fresh);
  });
}