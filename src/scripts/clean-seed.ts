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
    console.log(`\n🧹 Cleaning jobs for ${label} (${userId.slice(0, 8)}...)`);

    const result = await prisma.job.deleteMany({
      where: { userId },
    });

    totalDeleted += result.count;
    console.log(`  ✅ Deleted ${result.count} jobs`);
  }

  console.log(`\n✨ Clean complete! Total deleted: ${totalDeleted} jobs`);
}

main()
  .catch((e) => {
    console.error("Clean failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
