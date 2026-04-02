import { prisma } from "@/services/prisma";

type CreateJobInput = {
  userId: string;
  title: string;
  company: string;
  location?: string;
  stage?: string;
  lastActivityDate: string;
  priority?: boolean;
};

export async function getJobsByUserId(userId: string) {
  return prisma.job.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createJob(input: CreateJobInput) {
  return prisma.job.create({
    data: {
      userId: input.userId,
      title: input.title,
      company: input.company,
      location: input.location ?? "",
      stage: input.stage ?? "Interested",
      lastActivityDate: input.lastActivityDate,
      priority: input.priority ?? false,
    },
  });
}
