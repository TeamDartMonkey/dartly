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
    applicationDate: new Date("2026-03-15"),
    deadline: null,
    compensationNotes: "Base: $180k–$220k, RSU package, annual bonus 15%",
    recruiterNotes: "Spoke with Sarah from talent acquisition — team is growing fast, 2 positions open",
    customNotes: "Former colleague Marcus works here, can refer internally",
  },
  {
    title: "Full Stack Developer",
    company: "InnovateTech",
    location: "Remote",
    stage: "INTERVIEW" as const,
    priority: true,
    description: "Full stack development with React and Node.js",
    applicationDate: new Date("2026-03-20"),
    deadline: null,
    compensationNotes: "Base: $160k–$190k, stock options, $5k learning budget",
    recruiterNotes: "Recruiter Jake mentioned async culture, minimal meetings. Team of 6.",
    customNotes: "Onsite loop scheduled for next week. Need to prep system design round.",
  },
  {
    title: "Frontend Engineer",
    company: "WebSolutions",
    location: "New York, NY",
    stage: "INTERESTED" as const,
    priority: false,
    description: "Building modern web applications",
    applicationDate: new Date("2026-03-25"),
    deadline: null,
    compensationNotes: null,
    recruiterNotes: null,
    customNotes: "Found on LinkedIn — interesting product but haven't applied yet",
  },
  {
    title: "Backend Developer",
    company: "DataDriven",
    location: "Austin, TX",
    stage: "OFFER" as const,
    priority: true,
    description: "Developing high-performance APIs",
    applicationDate: new Date("2026-03-10"),
    compensationNotes: "Offered: $195k base, $25k sign-on, 401k match 6%, equity TBD",
    recruiterNotes: "HR says offer is negotiable on equity. Benefits are strong — unlimited PTO, health/dental/vision.",
    customNotes: "Top choice right now. Need to respond by April 5. Leverage other offers for equity.",
  },
  {
    title: "Software Engineer II",
    company: "StartupXYZ",
    location: "Remote",
    stage: "APPLIED" as const,
    priority: false,
    description: "Early-stage startup, equity opportunity",
    applicationDate: new Date("2026-03-28"),
    deadline: new Date("2026-04-30"),
    compensationNotes: "Base: $140k–$160k, 0.1–0.3% equity, Series A",
    recruiterNotes: null,
    customNotes: "Early stage so equity could be big. Risky but high upside. Need to research runway.",
  },
  {
    title: "QA Engineer",
    company: "TestLab",
    location: "Portland, OR",
    stage: "REJECTED" as const,
    priority: false,
    description: "Automated testing and CI quality gates",
    applicationDate: new Date("2026-03-05"),
    deadline: null,
    compensationNotes: "Base: $130k–$150k",
    recruiterNotes: "Generic rejection email — position filled internally",
    customNotes: "Good practice for interview prep. Moved on.",
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
    applicationDate: new Date("2026-03-12"),
    deadline: null,
    compensationNotes: "Base: $210k–$250k, RSUs, annual bonus 20%",
    recruiterNotes: "Recruiter Lisa — very responsive, team lead seemed enthusiastic after phone screen",
    customNotes: "Final round next Thursday. Prep for distributed systems deep-dive.",
  },
  {
    title: "React Developer",
    company: "AppWorks",
    location: "Chicago, IL",
    stage: "APPLIED" as const,
    priority: false,
    description: "Building customer-facing dashboard",
    applicationDate: new Date("2026-03-22"),
    deadline: null,
    compensationNotes: "Base: $150k–$170k, standard benefits",
    recruiterNotes: null,
    customNotes: "Saw posting on Wellfound. Dashboard product looks interesting.",
  },
  {
    title: "Platform Engineer",
    company: "CloudBase",
    location: "Remote",
    stage: "OFFER" as const,
    priority: true,
    description: "Infrastructure as code and CI/CD pipelines",
    applicationDate: new Date("2026-03-08"),
    compensationNotes: "Offered: $200k base, $30k sign-on, RSUs vesting 4yr, $10k relocation",
    recruiterNotes: "Offer letter received. Benefits are solid — 401k 8% match, wellness stipend.",
    customNotes: "Strong offer but CloudBase culture seems very on-call heavy. Weighing against GrowthLabs.",
  },
  {
    title: "DevOps Engineer",
    company: "ScaleOps",
    location: "Boston, MA",
    stage: "INTERESTED" as const,
    priority: true,
    description: "Managing Kubernetes clusters and monitoring",
    applicationDate: new Date("2026-03-26"),
    deadline: null,
    compensationNotes: "Estimate: $170k–$190k based on levels.fyi",
    recruiterNotes: "Reached out on LinkedIn — sounds like a hands-on role with lots of autonomy",
    customNotes: "Need to apply. Boston would require relocation but COL is reasonable.",
  },
  {
    title: "Backend Lead",
    company: "FinTech Co",
    location: "New York, NY",
    stage: "INTERVIEW" as const,
    priority: true,
    description: "Leading payment processing systems",
    applicationDate: new Date("2026-03-18"),
    deadline: null,
    compensationNotes: "Base: $220k–$260k, performance bonus, equity refresh annually",
    recruiterNotes: "Recruiter Tom — fast-tracked process due to competing offer. 3-person panel next.",
    customNotes: "FinTech domain is new to me but interesting. Need to brush up on PCI compliance basics.",
  },
  {
    title: "Full Stack Lead",
    company: "HealthTech",
    location: "Remote",
    stage: "APPLIED" as const,
    priority: false,
    description: "Patient management system development",
    applicationDate: new Date("2026-03-24"),
    compensationNotes: "Base: $175k–$200k, stock options",
    recruiterNotes: null,
    customNotes: "HIPAA-regulated environment could be interesting. Applied via company site.",
  },
  {
    title: "Data Engineer",
    company: "Analytics Inc",
    location: "Denver, CO",
    stage: "INTERESTED" as const,
    priority: false,
    description: "Building ETL pipelines and data warehouses",
    applicationDate: new Date("2026-03-27"),
    deadline: null,
    compensationNotes: null,
    recruiterNotes: null,
    customNotes: "Pivot role — more data-focused than I'd like but Denver is appealing",
  },
  {
    title: "ML Engineer",
    company: "AI Startup",
    location: "San Francisco, CA",
    stage: "APPLIED" as const,
    priority: true,
    description: "Deploying machine learning models to production",
    applicationDate: new Date("2026-03-14"),
    deadline: null,
    compensationNotes: "Base: $190k–$230k, significant equity (pre-IPO), flexible PTO",
    recruiterNotes: "Recruiter reached out via email — founding team is ex-Google Brain. High caliber.",
    customNotes: "Exciting space. Need to review transformer architecture before technical screen.",
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
    targetRoles: string[];
    targetLocations: string[];
    workModePreference: string | null;
    salaryPreference: number | null;
    experiences: {
      type: "EMPLOYMENT" | "PROJECT";
      title: string;
      organization: string | null;
      startDate: Date | null;
      endDate: Date | null;
      isCurrent: boolean;
      description: string | null;
      location: string | null;
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
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@email.com",
    phone: "(555) 123-4567",
    location: "San Francisco, CA",
    headline: "Full Stack Software Engineer",
    summary:
      "Experienced software engineer with 4+ years building scalable web applications. Passionate about clean architecture, developer experience, and shipping products that solve real problems. Strong background in TypeScript, React, and Node.js.",
    targetRoles: ["Full Stack Engineer", "Frontend Engineer", "Software Engineer"],
    targetLocations: ["San Francisco, CA", "Remote", "New York, NY"],
    workModePreference: "Remote",
    salaryPreference: 150000,
    experiences: [
      {
        type: "EMPLOYMENT",
        title: "Software Engineer",
        organization: "TechNova Inc.",
        location: "San Francisco, CA",
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
        location: "New York, NY",
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
        location: null,
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
    targetRoles: ["Staff Engineer", "Platform Engineer", "Backend Lead", "DevOps Engineer"],
    targetLocations: ["Seattle, WA", "Remote", "Austin, TX"],
    workModePreference: "Hybrid",
    salaryPreference: 200000,
    experiences: [
      {
        type: "EMPLOYMENT",
        title: "Senior Backend Engineer",
        organization: "CloudScale Systems",
        location: "Seattle, WA",
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
        location: "Austin, TX",
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
      targetRoles: data.targetRoles,
      targetLocations: data.targetLocations,
      workModePreference: data.workModePreference,
      salaryPreference: data.salaryPreference,
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

type SeedJob = {
  title: string;
  company: string;
  location: string;
  stage: JobStage;
  priority: boolean;
  description: string;
  applicationDate: Date;
  deadline?: Date | null;
  compensationNotes?: string | null;
  recruiterNotes?: string | null;
  customNotes?: string | null;
};

async function seedJobs(userId: string, jobs: SeedJob[], userLabel: string) {
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
          deadline: jobData.deadline ?? undefined,
          compensationNotes: jobData.compensationNotes ?? undefined,
          recruiterNotes: jobData.recruiterNotes ?? undefined,
          customNotes: jobData.customNotes ?? undefined,
          lastActivityAt: jobData.applicationDate || new Date(),
        },
      });

      const transitions = STAGE_TRANSITIONS[jobData.stage] ?? [{ from: null, to: jobData.stage }];
      const baseDate = jobData.applicationDate ?? new Date("2026-03-01");

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

async function main() {
  console.log("=== Dartly Demo Seed Script ===");

  await seedProfile(USER_A, "User A");
  await seedProfile(USER_B, "User B");
  await seedJobs(USER_A, USER_A_JOBS, "User A");
  await seedJobs(USER_B, USER_B_JOBS, "User B");

  const counts = {
    jobs: await prisma.job.count(),
    profiles: await prisma.profile.count(),
    experiences: await prisma.experience.count(),
    educations: await prisma.education.count(),
    skills: await prisma.skill.count(),
    activities: await prisma.jobActivity.count(),
    stageHistory: await prisma.jobStageHistory.count(),
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
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
