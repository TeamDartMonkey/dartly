import { prisma } from "@/services/prisma";

const USER_A = "a818c364-412a-4545-8c88-f7b4cba05307";
const USER_B = "77475f79-adb0-4de2-a61c-5ff34eb96ce7";

async function main() {
  console.log("=== Dartly Demo Clean Script ===");

  let totalDeleted = 0;

  for (const [label, userId] of [
    ["User A", USER_A],
    ["User B", USER_B],
  ]) {
    console.log(`\n🧹 Cleaning data for ${label} (${userId.slice(0, 8)}...)`);

    const skills = await prisma.skill.deleteMany({
      where: { profile: { userId } },
    });
    totalDeleted += skills.count;

    const educations = await prisma.education.deleteMany({
      where: { profile: { userId } },
    });
    totalDeleted += educations.count;

    const experiences = await prisma.experience.deleteMany({
      where: { profile: { userId } },
    });
    totalDeleted += experiences.count;

    const profile = await prisma.profile.deleteMany({
      where: { userId },
    });
    totalDeleted += profile.count;

    const docLinks = await prisma.jobDocumentLink.deleteMany({
      where: { job: { userId } },
    });
    totalDeleted += docLinks.count;

    const docVersions = await prisma.documentVersion.deleteMany({
      where: { document: { userId } },
    });
    totalDeleted += docVersions.count;

    const documents = await prisma.document.deleteMany({
      where: { userId },
    });
    totalDeleted += documents.count;

    const activities = await prisma.jobActivity.deleteMany({
      where: { job: { userId } },
    });
    totalDeleted += activities.count;

    const stageHistory = await prisma.jobStageHistory.deleteMany({
      where: { job: { userId } },
    });
    totalDeleted += stageHistory.count;

    const jobs = await prisma.job.deleteMany({
      where: { userId },
    });
    totalDeleted += jobs.count;

    console.log(`  ✅ Deleted all data for ${label}`);
  }

  console.log(`\n✨ Clean complete! Total records deleted: ${totalDeleted}`);
}

main()
  .catch((e) => {
    console.error("Clean failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
