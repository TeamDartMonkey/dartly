import { prisma } from "@/services/prisma";

const USER_A = "a818c364-412a-4545-8c88-f7b4cba05307";
const USER_B = "77475f79-adb0-4de2-a61c-5ff34eb96ce7";

const USER_A_JOBS = [
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

const USER_B_JOBS = [
  {
    title: "Staff Software Engineer",
    company: "GrowthLabs",
    location: "Seattle, WA",
    stage: "INTERVIEW" as const,
    priority: true,
    description: "Leading architecture for microservices platform",
    applicationDate: new Date("2024-03-12"),
  },
  {
    title: "React Developer",
    company: "AppWorks",
    location: "Chicago, IL",
    stage: "APPLIED" as const,
    priority: false,
    description: "Building customer-facing dashboard",
    applicationDate: new Date("2024-03-22"),
  },
  {
    title: "Platform Engineer",
    company: "CloudBase",
    location: "Remote",
    stage: "OFFER" as const,
    priority: true,
    description: "Infrastructure as code and CI/CD pipelines",
    applicationDate: new Date("2024-03-08"),
  },
  {
    title: "DevOps Engineer",
    company: "ScaleOps",
    location: "Boston, MA",
    stage: "INTERESTED" as const,
    priority: true,
    description: "Managing Kubernetes clusters and monitoring",
    applicationDate: new Date("2024-03-26"),
  },
  {
    title: "Backend Lead",
    company: "FinTech Co",
    location: "New York, NY",
    stage: "INTERVIEW" as const,
    priority: true,
    description: "Leading payment processing systems",
    applicationDate: new Date("2024-03-18"),
  },
  {
    title: "Full Stack Lead",
    company: "HealthTech",
    location: "Remote",
    stage: "APPLIED" as const,
    priority: false,
    description: "Patient management system development",
    applicationDate: new Date("2024-03-24"),
  },
  {
    title: "Data Engineer",
    company: "Analytics Inc",
    location: "Denver, CO",
    stage: "INTERESTED" as const,
    priority: false,
    description: "Building ETL pipelines and data warehouses",
    applicationDate: new Date("2024-03-27"),
  },
  {
    title: "ML Engineer",
    company: "AI Startup",
    location: "San Francisco, CA",
    stage: "APPLIED" as const,
    priority: true,
    description: "Deploying machine learning models to production",
    applicationDate: new Date("2024-03-14"),
  },
];

async function seedJobs(userId: string, jobs: typeof USER_A_JOBS, userLabel: string) {
  console.log(`\n🌱 Seeding ${jobs.length} jobs for ${userLabel} (${userId.slice(0, 8)}...)`);

  for (const jobData of jobs) {
    try {
      const job = await prisma.job.create({
        data: {
          userId,
          ...jobData,
          lastActivityAt: jobData.applicationDate || new Date(),
        },
      });
      console.log(`  ✅ Created: ${job.title} at ${job.company} (${job.stage})`);
    } catch (error) {
      console.error(`  ❌ Failed to create ${jobData.title}:`, error);
    }
  }
}

async function main() {
  console.log("=== Dartly Demo Seed Script ===");

  await seedJobs(USER_A, USER_A_JOBS, "User A");
  await seedJobs(USER_B, USER_B_JOBS, "User B");

  console.log("\n✨ Seed complete!");
  console.log(`   User A: ${USER_A_JOBS.length} jobs`);
  console.log(`   User B: ${USER_B_JOBS.length} jobs`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
