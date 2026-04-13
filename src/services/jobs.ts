import type { Job as PrismaJob, JobStage as PrismaJobStage } from "@prisma/client";
import { STAGE_PRISMA_TO_UI, STAGE_UI_TO_PRISMA } from "@/constants/job-stages";
import { prisma } from "@/services/prisma";
import type { Job, JobStage } from "@/types/job";

type CreateJobInput = {
  userId: string;
  title: string;
  company: string;
  location?: string;
  description?: string | null;
  compensationNotes?: string | null;
  applicationDate?: string | null;
  deadline?: string | null;
  recruiterNotes?: string | null;
  customNotes?: string | null;
  stage?: JobStage;
  priority?: boolean;
};

type UpdateJobInput = {
  title?: string;
  company?: string;
  location?: string;
  description?: string | null;
  compensationNotes?: string | null;
  applicationDate?: string | null;
  deadline?: string | null;
  recruiterNotes?: string | null;
  customNotes?: string | null;
  stage?: JobStage;
  priority?: boolean;
};

export function toJobResponse(job: PrismaJob): Job {
  return {
    id: job.id,
    title: job.title,
    company: job.company,
    stage: STAGE_PRISMA_TO_UI[job.stage] ?? "Interested",
    lastActivityDate: (job.lastActivityAt ?? job.createdAt).toISOString().slice(0, 10),
    location: job.location ?? undefined,
    description: job.description ?? undefined,
    compensationNotes: job.compensationNotes ?? undefined,
    applicationDate: job.applicationDate?.toISOString().slice(0, 10) ?? undefined,
    deadline: job.deadline?.toISOString().slice(0, 10) ?? undefined,
    recruiterNotes: job.recruiterNotes ?? undefined,
    customNotes: job.customNotes ?? undefined,
    priority: job.priority,
  };
}

export async function getJobsByUserId(userId: string) {
  return prisma.job.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createJob(data: CreateJobInput) {
  const prismaStage = data.stage
    ? (STAGE_UI_TO_PRISMA[data.stage] as PrismaJobStage)
    : "INTERESTED";

  return prisma.$transaction(async (tx) => {
    const job = await tx.job.create({
      data: {
        userId: data.userId,
        title: data.title,
        company: data.company,
        location: data.location,
        description: data.description,
        compensationNotes: data.compensationNotes,
        applicationDate: data.applicationDate ? new Date(data.applicationDate) : null,
        deadline: data.deadline ? new Date(data.deadline) : null,
        recruiterNotes: data.recruiterNotes,
        customNotes: data.customNotes,
        stage: prismaStage,
        priority: data.priority ?? false,
        lastActivityAt: new Date(),
      },
    });

    await tx.jobStageHistory.create({
      data: {
        jobId: job.id,
        fromStage: null,
        toStage: prismaStage,
      },
    });

    return job;
  });
}

export async function updateJob(id: string, userId: string, data: UpdateJobInput) {
  const existing = await prisma.job.findFirst({ where: { id, userId } });
  if (!existing) return null;

  const prismaStage = data.stage ? (STAGE_UI_TO_PRISMA[data.stage] as PrismaJobStage) : undefined;
  const stageChanged = prismaStage && prismaStage !== existing.stage;

  return prisma.$transaction(async (tx) => {
    const updated = await tx.job.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.company !== undefined && { company: data.company }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.compensationNotes !== undefined && { compensationNotes: data.compensationNotes }),
        ...(data.applicationDate !== undefined && { applicationDate: data.applicationDate ? new Date(data.applicationDate) : null }),
        ...(data.deadline !== undefined && { deadline: data.deadline ? new Date(data.deadline) : null }),
        ...(data.recruiterNotes !== undefined && { recruiterNotes: data.recruiterNotes }),
        ...(data.customNotes !== undefined && { customNotes: data.customNotes }),
        ...(prismaStage !== undefined && { stage: prismaStage }),
        ...(data.priority !== undefined && { priority: data.priority }),
        // Bumped on every save to surface "recently touched" jobs at the top of the
        // dashboard. Intentionally not gated on field changes.
        lastActivityAt: new Date(),
      },
    });

    if (stageChanged) {
      await tx.jobStageHistory.create({
        data: {
          jobId: id,
          fromStage: existing.stage,
          toStage: prismaStage,
        },
      });
    }

    return updated;
  });
}

export async function deleteJob(id: string, userId: string): Promise<boolean> {
  const { count } = await prisma.job.deleteMany({ where: { id, userId } });
  return count > 0;
}

export async function getJob(id: string, userId: string) {
  return prisma.job.findFirst({
    where: { id, userId },
  });
}