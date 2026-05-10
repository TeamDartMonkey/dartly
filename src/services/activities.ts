import { prisma } from "@/services/prisma";
import type { CreateActivityInput, UpdateActivityInput } from "@/types/schemas/activity";

// Verifies a job exists and belongs to the user before any activity operation.
export async function verifyJobOwnership(jobId: string, userId: string): Promise<boolean> {
  const job = await prisma.job.findFirst({ where: { id: jobId, userId }, select: { id: true } });
  return !!job;
}

// Returns all activities for a job, newest first. Caller is expected to have
// verified job ownership; we additionally constrain by the job relation so a
// missing ownership check still cannot leak across users.
export async function getActivities(jobId: string, userId: string) {
  return prisma.jobActivity.findMany({
    where: { jobId, job: { userId } },
    orderBy: { createdAt: "desc" },
  });
}

// Creates a new activity tied to a job. The transaction re-asserts ownership
// inside the same DB round trip so a missing caller-side check cannot create
// activities on jobs the user does not own.
export async function createActivity(jobId: string, userId: string, data: CreateActivityInput) {
  return prisma.$transaction(async (tx) => {
    const job = await tx.job.findFirst({ where: { id: jobId, userId }, select: { id: true } });
    if (!job) return null;
    return tx.jobActivity.create({
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
  });
}

// Updates an existing activity. updateMany scopes by the parent job's userId
// in a single DB statement, eliminating the prior read-then-update race that
// could clobber concurrent edits and bypass tenant isolation.
export async function updateActivity(
  activityId: string,
  jobId: string,
  userId: string,
  data: UpdateActivityInput
) {
  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.scheduledAt !== undefined) {
    updateData.scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;
  }
  if (data.roundType !== undefined) updateData.roundType = data.roundType;
  if (data.completed !== undefined) updateData.completed = data.completed;

  const { count } = await prisma.jobActivity.updateMany({
    where: { id: activityId, jobId, job: { userId } },
    data: updateData,
  });
  if (count === 0) return null;
  return prisma.jobActivity.findFirst({ where: { id: activityId } });
}

// Deletes an activity. deleteMany with the relation filter ensures the
// activity is only removed when it belongs to a job the user owns.
export async function deleteActivity(activityId: string, jobId: string, userId: string) {
  const { count } = await prisma.jobActivity.deleteMany({
    where: { id: activityId, jobId, job: { userId } },
  });
  return count > 0 ? { id: activityId } : null;
}
