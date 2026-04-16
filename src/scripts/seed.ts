import type { JobStage } from "@prisma/client";
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
  {
    title: "QA Engineer",
    company: "TestLab",
    location: "Portland, OR",
    stage: "REJECTED" as const,
    priority: false,
    description: "Automated testing and CI quality gates",
    applicationDate: new Date("2024-03-05"),
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

const PROFILES: Record<
  string,
  {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    headline: string;
    summary: string;
    experiences: {
      type: "EMPLOYMENT" | "PROJECT";
      title: string;
      organization: string | null;
      startDate: Date | null;
      endDate: Date | null;
      isCurrent: boolean;
      description: string | null;
      order: number;
    }[];
    educations: {
      institution: string;
      degree: string | null;
      fieldOfStudy: string | null;
      startDate: Date | null;
      endDate: Date | null;
      gpa: string | null;
    }[];
    skills: { name: string; category: string | null; proficiency: string | null; order: number }[];
  }
> = {
  [USER_A]: {
    firstName: "Alex",
    lastName: "Rivera",
    email: "alex.rivera@email.com",
    phone: "(555) 123-4567",
    location: "San Francisco, CA",
    headline: "Full Stack Software Engineer",
    summary:
      "Experienced software engineer with 4+ years building scalable web applications. Passionate about clean architecture, developer experience, and shipping products that solve real problems. Strong background in TypeScript, React, and Node.js.",
    experiences: [
      {
        type: "EMPLOYMENT",
        title: "Software Engineer",
        organization: "TechNova Inc.",
        startDate: new Date("2022-06-01"),
        endDate: null,
        isCurrent: true,
        description:
          "Full stack development on a B2B SaaS platform serving 50k+ users. Led migration from REST to GraphQL, reducing API payload size by 40%. Mentored 2 junior engineers.",
        order: 0,
      },
      {
        type: "EMPLOYMENT",
        title: "Junior Developer",
        organization: "WebForge LLC",
        startDate: new Date("2020-08-01"),
        endDate: new Date("2022-05-01"),
        isCurrent: false,
        description:
          "Built and maintained client-facing dashboards using React and TypeScript. Implemented automated CI/CD pipelines reducing deployment time by 60%.",
        order: 1,
      },
      {
        type: "PROJECT",
        title: "Open Source CLI Tool",
        organization: null,
        startDate: new Date("2023-01-01"),
        endDate: new Date("2023-06-01"),
        isCurrent: false,
        description:
          "Created and published a developer productivity CLI with 500+ GitHub stars. Written in TypeScript with comprehensive test coverage.",
        order: 2,
      },
    ],
    educations: [
      {
        institution: "New Jersey Institute of Technology",
        degree: "B.S.",
        fieldOfStudy: "Computer Science",
        startDate: new Date("2016-09-01"),
        endDate: new Date("2020-05-01"),
        gpa: "3.7",
      },
      {
        institution: "Hudson County Community College",
        degree: "A.S.",
        fieldOfStudy: "Computer Science",
        startDate: new Date("2014-09-01"),
        endDate: new Date("2016-05-01"),
        gpa: "3.8",
      },
    ],
    skills: [
      { name: "TypeScript", category: "Languages", proficiency: "Advanced", order: 0 },
      { name: "React", category: "Frameworks", proficiency: "Advanced", order: 1 },
      { name: "Node.js", category: "Runtime", proficiency: "Advanced", order: 2 },
      { name: "PostgreSQL", category: "Databases", proficiency: "Intermediate", order: 3 },
      { name: "Docker", category: "DevOps", proficiency: "Intermediate", order: 4 },
      { name: "GraphQL", category: "API", proficiency: "Intermediate", order: 5 },
    ],
  },
  [USER_B]: {
    firstName: "Jordan",
    lastName: "Kim",
    email: "jordan.kim@email.com",
    phone: "(555) 987-6543",
    location: "Seattle, WA",
    headline: "Senior Platform Engineer",
    summary:
      "Platform engineer with 6+ years of experience in distributed systems, cloud infrastructure, and developer tooling. Focused on building reliable, scalable backend systems. AWS certified with deep Kubernetes expertise.",
    experiences: [
      {
        type: "EMPLOYMENT",
        title: "Senior Backend Engineer",
        organization: "CloudScale Systems",
        startDate: new Date("2021-03-01"),
        endDate: null,
        isCurrent: true,
        description:
          "Architected event-driven microservices processing 10M+ events/day. Reduced infrastructure costs by 35% through right-sizing and spot instance optimization. Led on-call rotation for critical services.",
        order: 0,
      },
      {
        type: "EMPLOYMENT",
        title: "Backend Developer",
        organization: "DataPipe Corp",
        startDate: new Date("2018-07-01"),
        endDate: new Date("2021-02-01"),
        isCurrent: false,
        description:
          "Built real-time data processing pipelines using Kafka and Go. Designed and implemented a custom job scheduler handling 100k+ scheduled tasks daily.",
        order: 1,
      },
    ],
    educations: [
      {
        institution: "University of Washington",
        degree: "M.S.",
        fieldOfStudy: "Computer Science",
        startDate: new Date("2016-09-01"),
        endDate: new Date("2018-06-01"),
        gpa: "3.9",
      },
      {
        institution: "Rutgers University",
        degree: "B.S.",
        fieldOfStudy: "Computer Engineering",
        startDate: new Date("2012-09-01"),
        endDate: new Date("2016-05-01"),
        gpa: "3.6",
      },
    ],
    skills: [
      { name: "Go", category: "Languages", proficiency: "Advanced", order: 0 },
      { name: "Python", category: "Languages", proficiency: "Advanced", order: 1 },
      { name: "Kubernetes", category: "Infrastructure", proficiency: "Advanced", order: 2 },
      { name: "AWS", category: "Cloud", proficiency: "Advanced", order: 3 },
      { name: "Kafka", category: "Messaging", proficiency: "Intermediate", order: 4 },
      { name: "Terraform", category: "DevOps", proficiency: "Advanced", order: 5 },
    ],
  },
};

const STAGE_TRANSITIONS: Record<string, { from: string | null; to: string }[]> = {
  APPLIED: [{ from: null, to: "APPLIED" }],
  INTERVIEW: [
    { from: null, to: "APPLIED" },
    { from: "APPLIED", to: "INTERVIEW" },
  ],
  OFFER: [
    { from: null, to: "APPLIED" },
    { from: "APPLIED", to: "INTERVIEW" },
    { from: "INTERVIEW", to: "OFFER" },
  ],
  REJECTED: [
    { from: null, to: "APPLIED" },
    { from: "APPLIED", to: "REJECTED" },
  ],
  INTERESTED: [{ from: null, to: "INTERESTED" }],
};

const STAGE_LABELS: Record<string, string> = {
  INTERESTED: "Interested",
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
};

function getActivityDateForStage(_stage: string, transitionIndex: number, baseDate: Date): Date {
  const daysOffset = transitionIndex * 5;
  const d = new Date(baseDate);
  d.setDate(d.getDate() + daysOffset);
  return d;
}

async function seedProfile(userId: string, userLabel: string) {
  const data = PROFILES[userId];
  if (!data) return;

  console.log(`\n🌱 Seeding profile for ${userLabel}`);

  const profile = await prisma.profile.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      location: data.location,
      headline: data.headline,
      summary: data.summary,
    },
  });

  for (const exp of data.experiences) {
    await prisma.experience.create({
      data: { profileId: profile.id, ...exp },
    });
  }

  for (const edu of data.educations) {
    await prisma.education.create({
      data: { profileId: profile.id, ...edu },
    });
  }

  for (const skill of data.skills) {
    await prisma.skill.create({
      data: { profileId: profile.id, ...skill },
    });
  }

  console.log(
    `  ✅ Profile: ${data.experiences.length} experiences, ${data.educations.length} educations, ${data.skills.length} skills`
  );
}

async function seedJobs(userId: string, jobs: typeof USER_A_JOBS, userLabel: string) {
  console.log(`\n🌱 Seeding ${jobs.length} jobs for ${userLabel} (${userId.slice(0, 8)}...)`);

  for (const jobData of jobs) {
    try {
      const job = await prisma.job.create({
        data: {
          userId,
          title: jobData.title,
          company: jobData.company,
          location: jobData.location,
          stage: jobData.stage,
          priority: jobData.priority,
          description: jobData.description,
          applicationDate: jobData.applicationDate,
          lastActivityAt: jobData.applicationDate || new Date(),
        },
      });

      const transitions = STAGE_TRANSITIONS[jobData.stage] ?? [{ from: null, to: jobData.stage }];
      const baseDate = jobData.applicationDate ?? new Date("2024-03-01");

      for (let i = 0; i < transitions.length; i++) {
        const t = transitions[i];
        await prisma.jobStageHistory.create({
          data: {
            jobId: job.id,
            fromStage: t.from as JobStage | null,
            toStage: t.to as JobStage,
            changedAt: getActivityDateForStage(jobData.stage, i, baseDate),
          },
        });

        if (t.from !== null) {
          const fromLabel = STAGE_LABELS[t.from] ?? t.from;
          const toLabel = STAGE_LABELS[t.to] ?? t.to;
          await prisma.jobActivity.create({
            data: {
              jobId: job.id,
              type: "STAGE",
              title: `Stage changed: ${fromLabel} → ${toLabel}`,
              createdAt: getActivityDateForStage(jobData.stage, i, baseDate),
            },
          });
        }
      }

      if (jobData.stage === "INTERVIEW") {
        const interviewBase = new Date(baseDate);
        interviewBase.setDate(interviewBase.getDate() + 7);
        await prisma.jobActivity.create({
          data: {
            jobId: job.id,
            type: "INTERVIEW",
            title: "Technical Phone Screen",
            description: "45-min technical interview covering system design and coding",
            roundType: "PHONE_SCREEN",
            scheduledAt: interviewBase,
            completed: true,
            createdAt: interviewBase,
          },
        });
        const onsite = new Date(interviewBase);
        onsite.setDate(onsite.getDate() + 5);
        await prisma.jobActivity.create({
          data: {
            jobId: job.id,
            type: "INTERVIEW",
            title: "Onsite Interview Loop",
            description:
              "Full day: 4 rounds including system design, coding, behavioral, and hiring manager",
            roundType: "ONSITE",
            scheduledAt: onsite,
            completed: false,
            createdAt: onsite,
          },
        });
      }

      if (jobData.stage === "APPLIED" || jobData.stage === "INTERVIEW") {
        const followUpDate = new Date(baseDate);
        followUpDate.setDate(followUpDate.getDate() + 10);
        await prisma.jobActivity.create({
          data: {
            jobId: job.id,
            type: "FOLLOWUP",
            title: "Follow up on application status",
            description: "Send polite follow-up email to recruiter",
            scheduledAt: followUpDate,
            completed: false,
            createdAt: followUpDate,
          },
        });
      }

      await prisma.jobActivity.create({
        data: {
          jobId: job.id,
          type: "NOTE",
          title: "Application submitted",
          description: `Applied to ${jobData.company} for ${jobData.title} position`,
          createdAt: baseDate,
        },
      });

      console.log(`  ✅ Created: ${job.title} at ${job.company} (${job.stage})`);
    } catch (error) {
      console.error(`  ❌ Failed to create ${jobData.title}:`, error);
    }
  }
}

async function seedDocuments(userId: string, userLabel: string) {
  console.log(`\n🌱 Seeding documents for ${userLabel}`);

  const jobs = await prisma.job.findMany({ where: { userId }, take: 3 });
  const profile = await prisma.profile.findUnique({ where: { userId } });

  if (!profile || jobs.length === 0) {
    console.log("  ⚠️  Skipping documents (no profile or jobs found)");
    return;
  }

  const firstName = profile.firstName ?? "Candidate";
  const lastName = profile.lastName ?? "";
  const fullName = `${firstName} ${lastName}`.trim();
  const contactLine = [profile.email, profile.phone, profile.location].filter(Boolean).join(" | ");

  for (let i = 0; i < Math.min(jobs.length, 2); i++) {
    const job = jobs[i];

    const resumeDoc = await prisma.document.create({
      data: {
        userId,
        type: "RESUME",
        name: `Resume - ${job.company}`,
        status: "DRAFT",
      },
    });
    const resumeVersion = await prisma.documentVersion.create({
      data: {
        documentId: resumeDoc.id,
        versionNumber: 1,
        content: `# ${fullName}\n${contactLine}\n\n## Professional Summary\nTailored for ${job.title} at ${job.company}. ${profile.summary ?? ""}\n\n## Experience\n_See profile for full details._\n\n## Skills\n_See profile for full details._`,
      },
    });
    await prisma.jobDocumentLink.create({
      data: { jobId: job.id, documentId: resumeDoc.id, documentVersionId: resumeVersion.id },
    });

    const coverDoc = await prisma.document.create({
      data: {
        userId,
        type: "COVER_LETTER",
        name: `Cover Letter - ${job.company}`,
        status: "DRAFT",
      },
    });
    const coverVersion = await prisma.documentVersion.create({
      data: {
        documentId: coverDoc.id,
        versionNumber: 1,
        content: `Dear Hiring Manager at ${job.company},\n\nI am writing to express my interest in the ${job.title} position. With my background in software engineering, I believe I would be a strong fit for this role.\n\nThank you for your consideration.\n\nBest regards,\n${fullName}`,
      },
    });
    await prisma.jobDocumentLink.create({
      data: { jobId: job.id, documentId: coverDoc.id, documentVersionId: coverVersion.id },
    });

    console.log(`  ✅ Created resume + cover letter for ${job.title} at ${job.company}`);
  }
}

async function main() {
  console.log("=== Dartly Demo Seed Script ===");

  await seedProfile(USER_A, "User A");
  await seedProfile(USER_B, "User B");
  await seedJobs(USER_A, USER_A_JOBS, "User A");
  await seedJobs(USER_B, USER_B_JOBS, "User B");
  await seedDocuments(USER_A, "User A");
  await seedDocuments(USER_B, "User B");

  const counts = {
    jobs: await prisma.job.count(),
    profiles: await prisma.profile.count(),
    experiences: await prisma.experience.count(),
    educations: await prisma.education.count(),
    skills: await prisma.skill.count(),
    activities: await prisma.jobActivity.count(),
    stageHistory: await prisma.jobStageHistory.count(),
    documents: await prisma.document.count(),
    documentVersions: await prisma.documentVersion.count(),
    documentLinks: await prisma.jobDocumentLink.count(),
  };

  console.log("\n✨ Seed complete!");
  console.log("   Summary:");
  console.log(`   Jobs:             ${counts.jobs}`);
  console.log(`   Profiles:         ${counts.profiles}`);
  console.log(`   Experiences:      ${counts.experiences}`);
  console.log(`   Educations:       ${counts.educations}`);
  console.log(`   Skills:           ${counts.skills}`);
  console.log(`   Activities:       ${counts.activities}`);
  console.log(`   Stage History:    ${counts.stageHistory}`);
  console.log(`   Documents:        ${counts.documents}`);
  console.log(`   Document Versions:${counts.documentVersions}`);
  console.log(`   Document Links:   ${counts.documentLinks}`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
