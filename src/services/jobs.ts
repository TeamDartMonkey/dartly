import type { Job as PrismaJob, JobStage as PrismaJobStage } from "@prisma/client";
import { STAGE_PRISMA_TO_UI, STAGE_UI_TO_PRISMA } from "@/constants/job-stages";
import { prisma } from "@/services/prisma";
import type { Job, JobStage } from "@/types/job";

const STAGE_LABELS: Record<string, string> = {
  INTERESTED: "Interested",
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
  GHOSTED: "Ghosted",
  ARCHIVED: "Archived",
};

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
    createdAt: job.createdAt.toISOString().slice(0, 10),
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

// updateJob — Updates a job and atomically logs stage transitions.
// Wrapped in a Prisma $transaction so the job update, stage history record,
// activity log entry, and lastActivityAt bump all succeed or roll back together.
export async function updateJob(id: string, userId: string, data: UpdateJobInput) {
  // Fetch the existing job scoped to the authenticated user (ownership check).
  // Returns null if the job doesn't exist or belongs to a different user.
  const existing = await prisma.job.findFirst({ where: { id, userId } });
  if (!existing) return null;

  // Convert the UI-facing stage label (e.g. "Interview") to the Prisma enum value (e.g. "INTERVIEW").
  const prismaStage = data.stage ? (STAGE_UI_TO_PRISMA[data.stage] as PrismaJobStage) : undefined;
  // Gate: only create history/activity records when the stage actually changed.
  // This prevents spurious timeline entries when editing other fields (title, notes, etc.).
  const stageChanged = prismaStage && prismaStage !== existing.stage;
  // Clear the deadline when leaving "Interested" — it's only relevant for pre-application tracking.
  const leavingInterested = stageChanged && existing.stage === "INTERESTED";

  // Everything below runs inside a single database transaction.
  // If any write fails, the entire operation rolls back — no partial updates.
  return prisma.$transaction(async (tx) => {
    // Step 1: Update the job record with only the fields that were provided.
    // The spread pattern `...(condition && { field })` only includes the key
    // when the condition is truthy, so unchanged fields are left alone.
    const updated = await tx.job.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.company !== undefined && { company: data.company }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.compensationNotes !== undefined && { compensationNotes: data.compensationNotes }),
        ...(data.applicationDate !== undefined && {
          applicationDate: data.applicationDate ? new Date(data.applicationDate) : null,
        }),
        ...(data.deadline !== undefined && {
          deadline: data.deadline ? new Date(data.deadline) : null,
        }),
        ...(data.recruiterNotes !== undefined && { recruiterNotes: data.recruiterNotes }),
        ...(data.customNotes !== undefined && { customNotes: data.customNotes }),
        ...(prismaStage !== undefined && { stage: prismaStage }),
        ...(leavingInterested && { deadline: null }),
        ...(data.priority !== undefined && { priority: data.priority }),
        // Bumped on every save to surface "recently touched" jobs at the top of the
        // dashboard. Intentionally not gated on field changes.
        lastActivityAt: new Date(),
      },
    });

    // Step 2 (conditional): If the stage changed, record the transition.
    // This powers the Timeline tab and metrics like response rate.
    if (stageChanged) {
      // Log the from/to stages so we can reconstruct the full stage history later.
      await tx.jobStageHistory.create({
        data: {
          jobId: id,
          fromStage: existing.stage,
          toStage: prismaStage,
        },
      });

      // Create a human-readable activity entry for the Timeline tab.
      // Uses display labels (e.g. "Applied" instead of "APPLIED") for readability.
      const fromLabel = STAGE_LABELS[existing.stage] ?? existing.stage;
      const toLabel = STAGE_LABELS[prismaStage] ?? prismaStage;
      await tx.jobActivity.create({
        data: {
          jobId: id,
          type: "STAGE",
          title: `Stage changed: ${fromLabel} → ${toLabel}`,
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
