import { prisma } from "@/services/prisma";
import type { CreateActivityInput, UpdateActivityInput } from "@/types/schemas/activity";

// Verifies a job exists and belongs to the user before any activity operation.
export async function verifyJobOwnership(jobId: string, userId: string): Promise<boolean> {
  const job = await prisma.job.findFirst({ where: { id: jobId, userId }, select: { id: true } });
  return !!job;
}

// Returns all activities for a job, newest first.
export async function getActivities(jobId: string) {
  return prisma.jobActivity.findMany({
    where: { jobId },
    orderBy: { createdAt: "desc" },
  });
}

// Creates a new activity tied to a job.
export async function createActivity(jobId: string, data: CreateActivityInput) {
  return prisma.jobActivity.create({
    data: {
      jobId,
      type: data.type,
      title: data.title,
      description: data.description ?? null,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      roundType: data.roundType ?? null,
      completed: data.completed ?? false,
    },
  });
}

// Updates an existing activity. Requires jobId to prevent cross-job edits.
export async function updateActivity(activityId: string, jobId: string, data: UpdateActivityInput) {
  const existing = await prisma.jobActivity.findFirst({ where: { id: activityId, jobId } });
  if (!existing) return null;

  return prisma.jobActivity.update({
    where: { id: activityId },
    data: {
      title: data.title ?? existing.title,
      description: data.description !== undefined ? data.description : existing.description,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : existing.scheduledAt,
      roundType: data.roundType !== undefined ? data.roundType : existing.roundType,
      completed: data.completed !== undefined ? data.completed : existing.completed,
    },
  });
}

// Deletes an activity. Requires jobId to prevent cross-job deletes.
export async function deleteActivity(activityId: string, jobId: string) {
  const existing = await prisma.jobActivity.findFirst({ where: { id: activityId, jobId } });
  if (!existing) return null;
  return prisma.jobActivity.delete({ where: { id: activityId } });
}