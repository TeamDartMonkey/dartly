import { prisma } from "@/services/prisma";

const USER_ID = "86bef9c8-5d2c-40bb-aeb2-8580cecb4eb5";

async function main() {
  console.log("🧹 Cleaning demo jobs for user:", USER_ID);

  const result = await prisma.job.deleteMany({
    where: { userId: USER_ID },
  });

  console.log(`  ✅ Deleted ${result.count} jobs`);
  console.log("\n✨ Clean complete!");
}

main()
  .catch((e) => {
    console.error("Clean failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
