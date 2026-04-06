import { prisma } from "@/services/prisma";

const USER_ID = "86bef9c8-5d2c-40bb-aeb2-8580cecb4eb5";

const DEMO_JOBS = [
  {
    title: "Senior Software Engineer",
    company: "TechCorp",
    location: "San Francisco, CA",
    stage: "APPLIED" as const,
    priority: true,
    description: "Building scalable backend systems",
    applicationDate: new Date("2024-03-15"),
  },
  {
    title: "Full Stack Developer",
    company: "InnovateTech",
    location: "Remote",
    stage: "INTERVIEW" as const,
    priority: true,
    description: "Full stack development with React and Node.js",
    applicationDate: new Date("2024-03-20"),
  },
  {
    title: "Frontend Engineer",
    company: "WebSolutions",
    location: "New York, NY",
    stage: "INTERESTED" as const,
    priority: false,
    description: "Building modern web applications",
    applicationDate: new Date("2024-03-25"),
  },
  {
    title: "Backend Developer",
    company: "DataDriven",
    location: "Austin, TX",
    stage: "OFFER" as const,
    priority: true,
    description: "Developing high-performance APIs",
    applicationDate: new Date("2024-03-10"),
  },
  {
    title: "Software Engineer II",
    company: "StartupXYZ",
    location: "Remote",
    stage: "APPLIED" as const,
    priority: false,
    description: "Early-stage startup, equity opportunity",
    applicationDate: new Date("2024-03-28"),
  },
];

async function main() {
  console.log("🌱 Seeding demo jobs for user:", USER_ID);

  for (const jobData of DEMO_JOBS) {
    try {
      const job = await prisma.job.create({
        data: {
          userId: USER_ID,
          ...jobData,
          lastActivityAt: jobData.applicationDate || new Date(),
        },
      });
      console.log(`  ✅ Created: ${job.title} at ${job.company}`);
    } catch (error) {
      console.error(`  ❌ Failed to create ${jobData.title}:`, error);
    }
  }

  console.log("\n✨ Seed complete!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
