import { prisma } from "@/services/prisma";

export async function getJobsByUserId(userId: string) {
  return prisma.job.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createJob(data: {
  userId: string;
  title: string;
  company: string;
  location?: string;
  stage?: string;
  priority?: boolean;
}) {
  return prisma.job.create({
    data: {
      userId: data.userId,
      title: data.title,
      company: data.company,
      location: data.location,
      stage: data.stage ?? "INTERESTED",
      priority: data.priority ?? false,
      lastActivityAt: new Date(),
    },
  });
}