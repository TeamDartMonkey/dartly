import type { JobStage } from "@prisma/client";
import { prisma } from "@/services/prisma";

const USER_A = "a818c364-412a-4545-8c88-f7b4cba05307";
const USER_B = "77475f79-adb0-4de2-a61c-5ff34eb96ce7";

const USER_A_JOBS = [
  {
    title: "Software Engineer",
    company: "Cirrus Cloud",
    location: "Seattle, WA",
    stage: "INTERESTED" as const,
    priority: false,
    description: "Serverless compute platform and developer experience team with TypeScript",
    applicationDate: new Date("2026-04-19"),
    deadline: null,
    compensationNotes: "Estimate: $190k–$220k based on Glassdoor",
    recruiterNotes: "Recruiter reached out on LinkedIn — sounds like a new team being formed",
    customNotes: "Serverless DX team — very aligned with my interests. Rolling applications, no hard deadline.",
  },
  {
    title: "Staff Frontend Engineer",
    company: "ArcDev Tools",
    location: "Remote",
    stage: "INTERESTED" as const,
    priority: false,
    description: "Developer tooling and IDE extension platform built with React and WebAssembly",
    applicationDate: new Date("2026-04-17"),
    deadline: new Date("2026-04-30"),
    compensationNotes: null,
    recruiterNotes: null,
    customNotes: "Saw their tech talk at ReactConf. Impressive WASM-based editor. Need to tailor resume for this one.",
  },
  {
    title: "AI/ML Platform Engineer",
    company: "NeuralPath AI",
    location: "San Francisco, CA",
    stage: "INTERESTED" as const,
    priority: true,
    description: "Building ML infrastructure and model serving platform with TypeScript and Python",
    applicationDate: new Date("2026-04-15"),
    deadline: new Date("2026-05-01"),
    compensationNotes: "Estimate: $200k–$250k based on levels.fyi, pre-IPO equity",
    recruiterNotes: null,
    customNotes: "Found through a friend who works there. Growing fast, Series B. Should apply before deadline.",
  },
  {
    title: "Frontend Developer",
    company: "GreenWave",
    location: "Sacramento, CA",
    stage: "APPLIED" as const,
    priority: false,
    description: "Sustainability analytics dashboard with React and D3.js",
    applicationDate: new Date("2026-04-14"),
    deadline: null,
    compensationNotes: "Base: $140k–$160k, mission-driven company",
    recruiterNotes: null,
    customNotes: "Clean energy startup. Lower comp but mission-aligned. Applied on a whim.",
  },
  {
    title: "Frontend Engineer",
    company: "WebSolutions",
    location: "Seattle, WA",
    stage: "INTERESTED" as const,
    priority: false,
    description: "Building modern web applications with Next.js and Tailwind CSS",
    applicationDate: new Date("2026-04-13"),
    deadline: new Date("2026-05-15"),
    compensationNotes: null,
    recruiterNotes: null,
    customNotes: "Found on LinkedIn — interesting product but haven't applied yet",
  },
  {
    title: "TypeScript Engineer",
    company: "Vortex Labs",
    location: "Remote",
    stage: "APPLIED" as const,
    priority: false,
    description: "Real-time collaboration platform built with TypeScript and WebSockets",
    applicationDate: new Date("2026-04-12"),
    deadline: null,
    compensationNotes: "Base: $155k–$180k, equity, remote-first",
    recruiterNotes: null,
    customNotes: "CRDT-based collab tool. Interesting tech stack, Yjs and WebSockets.",
  },
  {
    title: "Node.js Backend Engineer",
    company: "Quantum Cloud",
    location: "Santa Monica, CA",
    stage: "APPLIED" as const,
    priority: false,
    description: "RESTful API development and database optimization with Node.js and PostgreSQL",
    applicationDate: new Date("2026-04-10"),
    deadline: null,
    compensationNotes: "Base: $170k–$200k, RSUs",
    recruiterNotes: null,
    customNotes: "Found on Hired.com. Looks like a solid mid-size company.",
  },
  {
    title: "React Developer",
    company: "DesignLab",
    location: "Remote",
    stage: "APPLIED" as const,
    priority: false,
    description: "Design system and component library development",
    applicationDate: new Date("2026-04-08"),
    deadline: null,
    compensationNotes: "Base: $150k–$170k, flexible PTO",
    recruiterNotes: null,
    customNotes: "Applied through their careers page. Design systems work would be fun.",
  },
  {
    title: "Web Developer",
    company: "CloudPeak",
    location: "Denver, CO",
    stage: "INTERVIEW" as const,
    priority: false,
    description: "Internal tooling and dashboard development with React and Tailwind CSS",
    applicationDate: new Date("2026-04-07"),
    deadline: null,
    compensationNotes: "Base: $160k–$180k, relocation offered",
    recruiterNotes: null,
    customNotes: "Denver would be a change. Had phone screen, waiting on next steps.",
  },
  {
    title: "Software Engineer",
    company: "Pacific AI",
    location: "San Francisco, CA",
    stage: "APPLIED" as const,
    priority: true,
    description: "Building AI-powered developer tools with TypeScript and React",
    applicationDate: new Date("2026-04-05"),
    deadline: null,
    compensationNotes: "Base: $190k–$240k, pre-IPO equity",
    recruiterNotes: "Recruiter reached out on LinkedIn. Founding team is ex-Stripe.",
    customNotes: "Very exciting product. Would love to get an interview here.",
  },
  {
    title: "Software Engineer II",
    company: "StartupXYZ",
    location: "Remote",
    stage: "APPLIED" as const,
    priority: false,
    description: "Early-stage startup building a TypeScript-first developer platform",
    applicationDate: new Date("2026-04-03"),
    deadline: null,
    compensationNotes: "Base: $140k–$160k, 0.1–0.3% equity, Series A",
    recruiterNotes: null,
    customNotes: "Early stage so equity could be big. Risky but high upside. Need to research runway.",
  },
  {
    title: "Full Stack Engineer",
    company: "Meridian Tech",
    location: "Palo Alto, CA",
    stage: "INTERVIEW" as const,
    priority: false,
    description: "Developer platform and internal tools with Next.js and Express",
    applicationDate: new Date("2026-04-02"),
    deadline: null,
    compensationNotes: "Base: $165k–$185k, stock options, wellness stipend",
    recruiterNotes: "Phone screen went well — they use React 19 and Server Components heavily",
    customNotes: "Healthcare domain is interesting. Good WLB from what Glassdoor says.",
  },
  {
    title: "Senior Software Engineer",
    company: "TechCorp",
    location: "San Francisco, CA",
    stage: "APPLIED" as const,
    priority: true,
    description: "Building scalable web applications and microservices with TypeScript and React",
    applicationDate: new Date("2026-03-30"),
    deadline: null,
    compensationNotes: "Base: $180k–$220k, RSU package, annual bonus 15%",
    recruiterNotes: "Spoke with Sarah from talent acquisition — team is growing fast, 2 positions open",
    customNotes: "Former colleague Marcus works here, can refer internally",
  },
  {
    title: "Staff Engineer",
    company: "NovaPay",
    location: "Remote",
    stage: "INTERVIEW" as const,
    priority: false,
    description: "Payment processing frontend and dashboard development with TypeScript",
    applicationDate: new Date("2026-03-27"),
    deadline: null,
    compensationNotes: "Base: $220k–$270k, RSUs, annual refresh",
    recruiterNotes: "Recruiter said feedback from phone screen was very positive",
    customNotes: "Staff level is a stretch but they approached me. Good practice either way.",
  },
  {
    title: "Java Developer",
    company: "EnterpriseGrid",
    location: "San Francisco, CA",
    stage: "REJECTED" as const,
    priority: false,
    description: "Spring Boot microservices for enterprise resource planning",
    applicationDate: new Date("2026-03-24"),
    deadline: null,
    compensationNotes: "Base: $150k–$175k, 401k match 5%",
    recruiterNotes: "Generic rejection email — position filled internally",
    customNotes: "Java is a stretch but I have academic experience. At least they got back to me quickly.",
  },
  {
    title: "Senior Frontend Engineer",
    company: "Bloom Health",
    location: "Remote",
    stage: "INTERVIEW" as const,
    priority: true,
    description: "Telehealth platform patient portal built with React and TypeScript",
    applicationDate: new Date("2026-03-20"),
    deadline: null,
    compensationNotes: "Base: $200k–$250k, significant equity",
    recruiterNotes: "Hiring manager liked my React portfolio projects. Moving to final round.",
    customNotes: "React 19 and Server Components — right in my wheelhouse. Prepped with docs.",
  },
  {
    title: "Full Stack Developer",
    company: "InnovateTech",
    location: "Los Angeles, CA",
    stage: "INTERVIEW" as const,
    priority: true,
    description: "Full stack development with React, Node.js, and PostgreSQL",
    applicationDate: new Date("2026-03-14"),
    deadline: null,
    compensationNotes: "Base: $160k–$190k, stock options, $5k learning budget",
    recruiterNotes: "Recruiter Jake mentioned async culture, minimal meetings. Team of 6.",
    customNotes: "Onsite loop scheduled for next week. Need to prep system design round.",
  },
  {
    title: "Full Stack Engineer",
    company: "Zephyr Logistics",
    location: "Remote",
    stage: "REJECTED" as const,
    priority: false,
    description: "Supply chain management platform with React and Express",
    applicationDate: new Date("2026-03-10"),
    deadline: null,
    compensationNotes: null,
    recruiterNotes: "Position was put on hold after final round. Budget cuts.",
    customNotes: "Made it to final round too. Bummer but out of my control.",
  },
  {
    title: "Frontend Engineer",
    company: "VeloCity",
    location: "San Francisco, CA",
    stage: "GHOSTED" as const,
    priority: false,
    description: "Urban mobility platform dashboard with React and Mapbox",
    applicationDate: new Date("2026-03-08"),
    deadline: null,
    compensationNotes: "Base: $175k–$200k, RSUs, commute credit",
    recruiterNotes: null,
    customNotes: "Applied through their site. Got a 'we received your application' email then nothing.",
  },
  {
    title: "Software Developer",
    company: "BrightPath EdTech",
    location: "Oakland, CA",
    stage: "REJECTED" as const,
    priority: false,
    description: "Online learning platform with Next.js and PostgreSQL",
    applicationDate: new Date("2026-03-07"),
    deadline: null,
    compensationNotes: "Base: $130k–$150k, education-focused mission",
    recruiterNotes: "Went with a candidate who had prior edtech experience",
    customNotes: "Nice company but comp was low anyway. No hard feelings.",
  },
  {
    title: "Backend Developer",
    company: "DataDriven",
    location: "San Jose, CA",
    stage: "OFFER" as const,
    priority: true,
    description: "Developing high-performance REST and GraphQL APIs with Node.js and PostgreSQL",
    applicationDate: new Date("2026-03-06"),
    deadline: null,
    compensationNotes: "Offered: $195k base, $25k sign-on, 401k match 6%, equity TBD",
    recruiterNotes: "HR says offer is negotiable on equity. Benefits are strong — unlimited PTO, health/dental/vision.",
    customNotes: "Top choice right now. Need to respond soon. Leverage other offers for equity.",
  },
  {
    title: "Full Stack Developer",
    company: "Stratos Cloud",
    location: "Denver, CO",
    stage: "GHOSTED" as const,
    priority: false,
    description: "Cloud management dashboard with React and Node.js",
    applicationDate: new Date("2026-03-05"),
    deadline: null,
    compensationNotes: "Base: $170k–$195k, RSUs, relocation",
    recruiterNotes: null,
    customNotes: "Denver would be nice. Applied online, got the auto-reply, nothing since.",
  },
  {
    title: "Full Stack Engineer",
    company: "Horizon Data",
    location: "San Jose, CA",
    stage: "REJECTED" as const,
    priority: false,
    description: "Data analytics dashboard with React, D3.js, and Node.js backend",
    applicationDate: new Date("2026-03-04"),
    deadline: null,
    compensationNotes: "Base: $175k–$210k",
    recruiterNotes: "Rejected after onsite — said they wanted more data visualization experience",
    customNotes: "Fair. My D3.js experience is limited. Good learning experience.",
  },
  {
    title: "React Developer",
    company: "MedSync Health",
    location: "Remote",
    stage: "GHOSTED" as const,
    priority: false,
    description: "Telemedicine platform patient portal with React and GraphQL",
    applicationDate: new Date("2026-03-03"),
    deadline: null,
    compensationNotes: "Base: $155k–$175k, stock options",
    recruiterNotes: null,
    customNotes: "Applied on Wellfound. Company seems legit but zero response after weeks.",
  },
  {
    title: "Software Engineer",
    company: "TerraForm Cloud",
    location: "Seattle, WA",
    stage: "GHOSTED" as const,
    priority: false,
    description: "Web platform development with Next.js and Tailwind CSS",
    applicationDate: new Date("2026-03-02"),
    deadline: null,
    compensationNotes: "Base: $180k–$210k, RSUs",
    recruiterNotes: null,
    customNotes: "Applied through Hired.com. Their portal says 'Under Review' for over a month.",
  },
  {
    title: "Full Stack Engineer",
    company: "Redwood Systems",
    location: "San Jose, CA",
    stage: "OFFER" as const,
    priority: false,
    description: "Enterprise SaaS dashboard development with React and Express",
    applicationDate: new Date("2026-03-01"),
    deadline: null,
    compensationNotes: "Offered: $175k base, $10k sign-on, stock options",
    recruiterNotes: "Got the offer letter via email. Standard benefits package.",
    customNotes: "Safest option but least exciting product. Backup plan.",
  },
  {
    title: "Node.js Developer",
    company: "IronVault",
    location: "Seattle, WA",
    stage: "REJECTED" as const,
    priority: false,
    description: "Cybersecurity compliance platform API with Express and MongoDB",
    applicationDate: new Date("2026-02-28"),
    deadline: null,
    compensationNotes: null,
    recruiterNotes: "Recruiter call went well but hiring manager ghosted for 3 weeks then rejected",
    customNotes: "Weird process. Red flags anyway — glad it didn't work out.",
  },
  {
    title: "TypeScript Developer",
    company: "QuantumBit",
    location: "San Jose, CA",
    stage: "GHOSTED" as const,
    priority: false,
    description: "Developer SDK and tooling platform built with TypeScript",
    applicationDate: new Date("2026-02-27"),
    deadline: null,
    compensationNotes: "Base: $190k–$230k, significant equity",
    recruiterNotes: null,
    customNotes: "Bleeding edge tech. Applied cold. Probably gets 1000s of applications.",
  },
  {
    title: "Frontend Engineer",
    company: "Nimbus SaaS",
    location: "Remote",
    stage: "REJECTED" as const,
    priority: false,
    description: "Project management SaaS tool built with React and GraphQL",
    applicationDate: new Date("2026-02-24"),
    deadline: null,
    compensationNotes: "Base: $145k–$165k",
    recruiterNotes: "Said team decided to go with someone who had more B2B experience",
    customNotes: "Fair feedback. Need to highlight B2B SaaS work more on resume.",
  },
  {
    title: "Software Engineer",
    company: "CloudNine Systems",
    location: "Remote",
    stage: "GHOSTED" as const,
    priority: false,
    description: "Cloud-native SaaS application development with TypeScript",
    applicationDate: new Date("2026-02-23"),
    deadline: null,
    compensationNotes: "Base: $160k–$185k, RSUs, remote-first",
    recruiterNotes: null,
    customNotes: "Applied online. Got auto-confirmation email then nothing for weeks.",
  },
  {
    title: "Next.js Engineer",
    company: "CloudPeak SaaS",
    location: "Remote",
    stage: "OFFER" as const,
    priority: false,
    description: "Server-side rendered SaaS platform with Next.js 14 and PostgreSQL",
    applicationDate: new Date("2026-02-22"),
    deadline: null,
    compensationNotes: "Offered: $185k base, $15k sign-on, standard equity package",
    recruiterNotes: "Recruiter says team is expanding to support new product line",
    customNotes: "Decent offer but below DataDriven. Could use as leverage.",
  },
  {
    title: "Java Full Stack Developer",
    company: "Iceberg Data",
    location: "Remote",
    stage: "GHOSTED" as const,
    priority: false,
    description: "Enterprise data platform with Java backend and React frontend",
    applicationDate: new Date("2026-02-21"),
    deadline: null,
    compensationNotes: "Base: $185k–$210k, equity",
    recruiterNotes: null,
    customNotes: "Java is a stretch from school but the React frontend work aligns. No response.",
  },
  {
    title: "Software Engineer",
    company: "TerraLink",
    location: "Los Angeles, CA",
    stage: "REJECTED" as const,
    priority: false,
    description: "Geospatial data visualization platform with React and Mapbox",
    applicationDate: new Date("2026-02-20"),
    deadline: null,
    compensationNotes: null,
    recruiterNotes: "Auto-rejection email. Never even got a phone screen.",
    customNotes: "Probably ATS filtered. Should have tailored resume more.",
  },
  {
    title: "React Engineer",
    company: "DeepCore AI",
    location: "San Francisco, CA",
    stage: "GHOSTED" as const,
    priority: false,
    description: "AI-powered code editor frontend built with React and TypeScript",
    applicationDate: new Date("2026-02-17"),
    deadline: null,
    compensationNotes: "Base: $200k–$250k, pre-IPO equity",
    recruiterNotes: null,
    customNotes: "Applied through referral from ex-coworker. Never heard back. Followed up twice.",
  },
  {
    title: "Full Stack Developer",
    company: "PixelForge",
    location: "San Francisco, CA",
    stage: "REJECTED" as const,
    priority: false,
    description: "Creative tools and design platform built with React and Node.js",
    applicationDate: new Date("2026-02-16"),
    deadline: null,
    compensationNotes: "Base: $160k–$185k",
    recruiterNotes: "Rejected after take-home assignment — went with internal candidate",
    customNotes: "Spent 6 hours on that take-home. Annoying but it happens.",
  },
  {
    title: "Full Stack Developer",
    company: "EcoVolt Energy",
    location: "Portland, OR",
    stage: "GHOSTED" as const,
    priority: false,
    description: "Energy management dashboard with React and Node.js",
    applicationDate: new Date("2026-02-13"),
    deadline: null,
    compensationNotes: "Base: $150k–$170k, stock options, green energy mission",
    recruiterNotes: null,
    customNotes: "Clean energy startup. Applied via their careers page. Zero response.",
  },
  {
    title: "Junior Frontend Developer",
    company: "ByteShop",
    location: "Phoenix, AZ",
    stage: "REJECTED" as const,
    priority: false,
    description: "E-commerce storefront development with React and Bootstrap",
    applicationDate: new Date("2026-02-12"),
    deadline: null,
    compensationNotes: "Base: $110k–$130k",
    recruiterNotes: "Rejection after phone screen — said they wanted more backend depth",
    customNotes: "Probably overqualified anyway. Was one of my first applications of the cycle.",
  },
  {
    title: "Backend Engineer",
    company: "Nextera Fintech",
    location: "Austin, TX",
    stage: "GHOSTED" as const,
    priority: false,
    description: "Payment processing microservices with Node.js and PostgreSQL",
    applicationDate: new Date("2026-02-09"),
    deadline: null,
    compensationNotes: "Base: $175k–$200k, equity, annual bonus",
    recruiterNotes: "Recruiter reached out on LinkedIn, seemed interested. Then went silent.",
    customNotes: "Typical recruiter ghost. They probably filled the req internally.",
  },
  {
    title: "Frontend Engineer",
    company: "PixelDream Studios",
    location: "Los Angeles, CA",
    stage: "GHOSTED" as const,
    priority: false,
    description: "Creative tools with real-time collaboration features using React and WebSockets",
    applicationDate: new Date("2026-02-05"),
    deadline: null,
    compensationNotes: "Base: $165k–$190k, equity, creative perks",
    recruiterNotes: null,
    customNotes: "Submitted a portfolio along with application. Crickets.",
  },
  {
    title: "Senior Software Engineer",
    company: "Apex Dynamics",
    location: "San Francisco, CA",
    stage: "GHOSTED" as const,
    priority: false,
    description: "Web application platform for industrial IoT dashboards with React",
    applicationDate: new Date("2026-02-01"),
    deadline: null,
    compensationNotes: "Base: $195k–$240k, equity, annual refresh",
    recruiterNotes: null,
    customNotes: "Applied nearly 3 months ago. Website still shows the posting as active though.",
  },
  {
    title: "Node.js Backend Developer",
    company: "SolarGrid Energy",
    location: "Remote",
    stage: "GHOSTED" as const,
    priority: false,
    description: "Renewable energy grid management API with Express and PostgreSQL",
    applicationDate: new Date("2026-01-26"),
    deadline: null,
    compensationNotes: "Base: $155k–$175k, stock options, green energy mission",
    recruiterNotes: null,
    customNotes: "Applied nearly 3 months ago. Totally silent. Job is probably not real.",
  },
  {
    title: "Junior Software Engineer",
    company: "StartupXYZ clone",
    location: "Remote",
    stage: "ARCHIVED" as const,
    priority: false,
    description: "Early-stage TypeScript startup building developer tools",
    applicationDate: new Date("2026-01-20"),
    deadline: null,
    compensationNotes: "Base: $100k–$120k, 0.5% equity",
    recruiterNotes: null,
    customNotes: "Was exploring early-stage options. Decided the risk wasn't worth it.",
  },
  {
    title: "Frontend Developer",
    company: "OldGuard Insurance",
    location: "Hartford, CT",
    stage: "ARCHIVED" as const,
    priority: false,
    description: "Legacy insurance claims portal modernization with React and Bootstrap",
    applicationDate: new Date("2026-01-14"),
    deadline: null,
    compensationNotes: "Base: $140k–$160k, pension, good benefits",
    recruiterNotes: null,
    customNotes: "Applied months ago, lost interest. Legacy tech stack, boring domain.",
  },
  {
    title: "Web Developer",
    company: "TestPro Inc",
    location: "Phoenix, AZ",
    stage: "ARCHIVED" as const,
    priority: false,
    description: "Internal testing dashboard with React and Tailwind CSS",
    applicationDate: new Date("2026-01-08"),
    deadline: null,
    compensationNotes: "Base: $90k–$110k",
    recruiterNotes: null,
    customNotes: "Applied early in the cycle when I was casting a wide net. Not the direction I want.",
  },
];

const USER_B_JOBS = [
  {
    title: "Data Engineer",
    company: "Analytics Inc",
    location: "Washington, DC",
    stage: "INTERESTED" as const,
    priority: false,
    description: "Building ETL pipelines and data warehouses",
    applicationDate: new Date("2026-04-16"),
    deadline: null,
    compensationNotes: null,
    recruiterNotes: null,
    customNotes: "Pivot role — more data-focused than I'd like but DC is appealing",
  },
  {
    title: "DevOps Engineer",
    company: "ScaleOps",
    location: "Boston, MA",
    stage: "INTERESTED" as const,
    priority: true,
    description: "Managing Kubernetes clusters and monitoring at scale",
    applicationDate: new Date("2026-04-14"),
    deadline: new Date("2026-04-28"),
    compensationNotes: "Estimate: $170k–$190k based on levels.fyi",
    recruiterNotes: "Reached out on LinkedIn — sounds like a hands-on role with lots of autonomy",
    customNotes: "Still interested. Should apply before deadline.",
  },
  {
    title: "Senior Software Engineer",
    company: "PulsePoint Health",
    location: "New Brunswick, NJ",
    stage: "APPLIED" as const,
    priority: false,
    description: "Healthcare data interoperability platform",
    applicationDate: new Date("2026-04-10"),
    deadline: null,
    compensationNotes: "Base: $170k–$195k, 401k match 5%, tuition reimbursement",
    recruiterNotes: null,
    customNotes: "10 minutes from home. Healthcare isn't my passion but the commute is unbeatable.",
  },
  {
    title: "Site Reliability Engineer",
    company: "Atlas Cloud",
    location: "New York, NY",
    stage: "APPLIED" as const,
    priority: false,
    description: "Keeping multi-region cloud infrastructure reliable",
    applicationDate: new Date("2026-04-08"),
    deadline: null,
    compensationNotes: "Base: $185k–$215k, RSUs, on-call compensation",
    recruiterNotes: null,
    customNotes: "Applied on a whim. SRE wasn't my focus but the infra work is appealing.",
  },
  {
    title: "Systems Engineer",
    company: "Pinnacle Defense",
    location: "Arlington, VA",
    stage: "INTERVIEW" as const,
    priority: false,
    description: "Mission-critical distributed systems for defense contracts",
    applicationDate: new Date("2026-04-06"),
    deadline: null,
    compensationNotes: "Base: $190k–$220k, clearance required, 9/80 schedule",
    recruiterNotes: null,
    customNotes: "Defense is a big commitment with clearance. Interviewing to keep options open.",
  },
  {
    title: "Go Developer",
    company: "FleetIO",
    location: "Remote",
    stage: "APPLIED" as const,
    priority: false,
    description: "Fleet management IoT platform",
    applicationDate: new Date("2026-04-05"),
    deadline: null,
    compensationNotes: "Base: $160k–$180k, stock options, hardware perk",
    recruiterNotes: null,
    customNotes: "Go + IoT is a cool combo. Small team, series B. Applied on their site.",
  },
  {
    title: "Staff Engineer",
    company: "Vertex Labs",
    location: "Boston, MA",
    stage: "APPLIED" as const,
    priority: false,
    description: "Event-driven systems and real-time data pipelines",
    applicationDate: new Date("2026-04-03"),
    deadline: null,
    compensationNotes: "Base: $200k–$240k, equity, annual bonus",
    recruiterNotes: null,
    customNotes: "Kafka-heavy role which is right up my alley. Applied through referral.",
  },
  {
    title: "Full Stack Developer",
    company: "MapleTech",
    location: "Remote",
    stage: "INTERVIEW" as const,
    priority: false,
    description: "Canadian SaaS expanding to US market, remote-first",
    applicationDate: new Date("2026-04-02"),
    deadline: null,
    compensationNotes: "Base: $165k–$185k CAD equivalent, stock options",
    recruiterNotes: "Phone screen with CTO — chill vibe, small but profitable company",
    customNotes: "Interesting product but Canadian payroll could be a headache.",
  },
  {
    title: "Backend Developer",
    company: "Shield Cyber",
    location: "Arlington, VA",
    stage: "APPLIED" as const,
    priority: true,
    description: "Cybersecurity threat detection platform",
    applicationDate: new Date("2026-04-01"),
    deadline: null,
    compensationNotes: "Base: $180k–$210k, clearance bonus, RSUs",
    recruiterNotes: "Recruiter found me on LinkedIn. Need active clearance which I don't have.",
    customNotes: "Applied anyway — they said they can sponsor clearance. Would take 3-6 months though.",
  },
  {
    title: "ML Engineer",
    company: "AI Startup",
    location: "New York, NY",
    stage: "APPLIED" as const,
    priority: true,
    description: "Deploying machine learning models to production",
    applicationDate: new Date("2026-03-30"),
    deadline: null,
    compensationNotes: "Base: $190k–$230k, significant equity (pre-IPO), flexible PTO",
    recruiterNotes: "Recruiter reached out via email — founding team is ex-Google Brain. High caliber.",
    customNotes: "Exciting space. Need to review transformer architecture before technical screen.",
  },
  {
    title: "Backend Engineer",
    company: "TradeFlow",
    location: "Jersey City, NJ",
    stage: "INTERVIEW" as const,
    priority: true,
    description: "Real-time trade settlement and reconciliation",
    applicationDate: new Date("2026-03-28"),
    deadline: null,
    compensationNotes: "Base: $200k–$230k, bonus 20-40%, equity",
    recruiterNotes: "VP of Eng reached out directly on LinkedIn. Fast-tracking the process.",
    customNotes: "FinTech in JC — easy commute via PATH. Very interested. Prepping for system design.",
  },
  {
    title: "React Developer",
    company: "AppWorks",
    location: "Philadelphia, PA",
    stage: "APPLIED" as const,
    priority: false,
    description: "Building customer-facing dashboard for fintech clients",
    applicationDate: new Date("2026-03-27"),
    deadline: null,
    compensationNotes: "Base: $150k–$170k, standard benefits",
    recruiterNotes: null,
    customNotes: "Saw posting on Wellfound. Dashboard product looks interesting.",
  },
  {
    title: "Full Stack Lead",
    company: "HealthTech",
    location: "Remote",
    stage: "APPLIED" as const,
    priority: false,
    description: "Patient management system development",
    applicationDate: new Date("2026-03-25"),
    deadline: null,
    compensationNotes: "Base: $175k–$200k, stock options",
    recruiterNotes: null,
    customNotes: "HIPAA-regulated environment could be interesting. Applied via company site.",
  },
  {
    title: "Cloud Architect",
    company: "Nimbus Infrastructure",
    location: "Boston, MA",
    stage: "INTERVIEW" as const,
    priority: false,
    description: "Designing multi-cloud architectures for enterprise clients",
    applicationDate: new Date("2026-03-24"),
    deadline: null,
    compensationNotes: "Base: $210k–$250k, consulting bonus structure",
    recruiterNotes: "Had first round with principal engineer — went really well",
    customNotes: "Architecture role is a bit of a pivot from hands-on but interesting long-term.",
  },
  {
    title: "Backend Engineer",
    company: "UrbanLogix",
    location: "Philadelphia, PA",
    stage: "REJECTED" as const,
    priority: false,
    description: "Smart city data platform",
    applicationDate: new Date("2026-03-22"),
    deadline: null,
    compensationNotes: "Base: $155k–$175k, city government contracts",
    recruiterNotes: "Went with a candidate referred by a city official. Classic.",
    customNotes: "Nepotism at its finest. Whatever, the tech stack was dated anyway.",
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
    title: "Staff Software Engineer",
    company: "GrowthLabs",
    location: "New York, NY",
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
    title: "Software Engineer",
    company: "ByteFlow Analytics",
    location: "Remote",
    stage: "GHOSTED" as const,
    priority: false,
    description: "Real-time analytics dashboard platform",
    applicationDate: new Date("2026-03-11"),
    deadline: null,
    compensationNotes: "Base: $170k–$195k, equity, remote-first",
    recruiterNotes: null,
    customNotes: "Applied via referral. The person who referred me left the company a week later. Dead end.",
  },
  {
    title: "Cloud Architect",
    company: "SkyBridge Tech",
    location: "Hartford, CT",
    stage: "GHOSTED" as const,
    priority: false,
    description: "Multi-cloud migration consulting and architecture",
    applicationDate: new Date("2026-03-09"),
    deadline: null,
    compensationNotes: "Base: $180k–$210k, consulting bonus",
    recruiterNotes: null,
    customNotes: "Consulting firm. Applied on LinkedIn Easy Apply. Probably wasn't a real posting.",
  },
  {
    title: "Senior Developer",
    company: "MetroBank Tech",
    location: "Wilmington, DE",
    stage: "REJECTED" as const,
    priority: false,
    description: "Banking platform modernization from legacy to microservices",
    applicationDate: new Date("2026-03-10"),
    deadline: null,
    compensationNotes: "Base: $180k–$200k, banking benefits and pension",
    recruiterNotes: "Said my lack of banking/finance experience was the deciding factor",
    customNotes: "Expected this one. Banking is its own world. Good practice though.",
  },
  {
    title: "Platform Engineer",
    company: "CloudBase",
    location: "Remote",
    stage: "OFFER" as const,
    priority: true,
    description: "Infrastructure as code and CI/CD pipelines",
    applicationDate: new Date("2026-03-08"),
    deadline: null,
    compensationNotes: "Offered: $200k base, $30k sign-on, RSUs vesting 4yr",
    recruiterNotes: "Offer letter received. Benefits are solid — 401k 8% match, wellness stipend.",
    customNotes: "Strong offer but CloudBase culture seems very on-call heavy. Weighing against GrowthLabs.",
  },
  {
    title: "Software Engineer",
    company: "NeonLabs",
    location: "Remote",
    stage: "GHOSTED" as const,
    priority: false,
    description: "Serverless computing platform developer tools",
    applicationDate: new Date("2026-03-07"),
    deadline: null,
    compensationNotes: "Base: $170k–$195k, equity, remote-first",
    recruiterNotes: null,
    customNotes: "Startup. Applied via their website. No human contact whatsoever.",
  },
  {
    title: "Staff Engineer",
    company: "IronBridge Security",
    location: "Reston, VA",
    stage: "GHOSTED" as const,
    priority: false,
    description: "Zero-trust security platform architecture",
    applicationDate: new Date("2026-03-05"),
    deadline: null,
    compensationNotes: "Base: $210k–$250k, equity, clearance bonus",
    recruiterNotes: "Had one call with hiring manager. Said next steps would come in a week. Ghosted.",
    customNotes: "Got my hopes up after the call. Extremely frustrating.",
  },
  {
    title: "Software Engineer",
    company: "AquaPure Systems",
    location: "Trenton, NJ",
    stage: "REJECTED" as const,
    priority: false,
    description: "Water quality monitoring IoT systems",
    applicationDate: new Date("2026-03-06"),
    deadline: null,
    compensationNotes: "Base: $135k–$155k",
    recruiterNotes: "Position was cancelled due to budget freeze",
    customNotes: "Never even got to interview. Budget freeze hit the whole department.",
  },
  {
    title: "Senior Software Engineer",
    company: "VaultPay",
    location: "Jersey City, NJ",
    stage: "GHOSTED" as const,
    priority: false,
    description: "Digital wallet and payment processing backend",
    applicationDate: new Date("2026-03-03"),
    deadline: null,
    compensationNotes: "Base: $195k–$230k, equity, performance bonus",
    recruiterNotes: "Recruiter messaged me on LinkedIn. We exchanged 2 emails then she disappeared.",
    customNotes: "Classic recruiter ghost. She probably left the company or the req got frozen.",
  },
  {
    title: "Platform Engineer",
    company: "DataForge",
    location: "Reston, VA",
    stage: "REJECTED" as const,
    priority: false,
    description: "Data platform and analytics infrastructure",
    applicationDate: new Date("2026-03-01"),
    deadline: null,
    compensationNotes: "Base: $170k–$195k",
    recruiterNotes: "Rejected after phone screen — they wanted more Python-heavy experience",
    customNotes: "Go is my strength not Python. Fair assessment.",
  },
  {
    title: "Backend Engineer",
    company: "StreamVault",
    location: "New York, NY",
    stage: "GHOSTED" as const,
    priority: false,
    description: "Live streaming infrastructure and CDN optimization",
    applicationDate: new Date("2026-02-27"),
    deadline: null,
    compensationNotes: "Base: $185k–$210k, RSUs, streaming perks",
    recruiterNotes: null,
    customNotes: "Applied through referral. Said they'd get back to me in a week. Been weeks.",
  },
  {
    title: "Platform Engineer",
    company: "Harbor Systems",
    location: "Remote",
    stage: "OFFER" as const,
    priority: false,
    description: "Internal developer platform and tooling",
    applicationDate: new Date("2026-02-25"),
    deadline: null,
    compensationNotes: "Offered: $195k base, $20k sign-on, RSUs, fully remote",
    recruiterNotes: "Recruiter says team is distributed across East Coast. Very flexible on start date.",
    customNotes: "Great WLB from what I hear. Lowest offer but best culture fit. Thinking about it.",
  },
  {
    title: "DevOps Lead",
    company: "Summit Logic",
    location: "Princeton, NJ",
    stage: "REJECTED" as const,
    priority: false,
    description: "DevOps team lead for semiconductor company",
    applicationDate: new Date("2026-02-24"),
    deadline: null,
    compensationNotes: "Base: $175k–$195k, semiconductor industry benefits",
    recruiterNotes: "Decided to go with someone who had semiconductor domain experience",
    customNotes: "Niche industry. Didn't expect to get far but close to home was tempting.",
  },
  {
    title: "Platform Engineer",
    company: "CirrusData",
    location: "Philadelphia, PA",
    stage: "GHOSTED" as const,
    priority: false,
    description: "Data pipeline orchestration platform",
    applicationDate: new Date("2026-02-22"),
    deadline: null,
    compensationNotes: "Base: $170k–$195k, stock options",
    recruiterNotes: null,
    customNotes: "Applied online. Got an auto-reply and then silence for weeks.",
  },
  {
    title: "Senior Backend Engineer",
    company: "Capital Grid",
    location: "New York, NY",
    stage: "OFFER" as const,
    priority: false,
    description: "Trading platform backend services",
    applicationDate: new Date("2026-02-20"),
    deadline: null,
    compensationNotes: "Offered: $230k base, $40k sign-on, performance bonus up to 30%",
    recruiterNotes: "Verbal offer confirmed. Written offer coming Monday.",
    customNotes: "Highest TC so far but intense culture. 60+ hour weeks expected.",
  },
  {
    title: "Full Stack Engineer",
    company: "NovaCare",
    location: "New York, NY",
    stage: "REJECTED" as const,
    priority: false,
    description: "Patient scheduling and billing platform",
    applicationDate: new Date("2026-02-19"),
    deadline: null,
    compensationNotes: null,
    recruiterNotes: "Ghosted for 4 weeks after final round. Then a form rejection. Unprofessional.",
    customNotes: "Dodged a bullet. Their process was chaotic from the start.",
  },
  {
    title: "Go Developer",
    company: "MeshNet IoT",
    location: "Remote",
    stage: "GHOSTED" as const,
    priority: false,
    description: "IoT device management platform in Go",
    applicationDate: new Date("2026-02-17"),
    deadline: null,
    compensationNotes: "Base: $160k–$180k, stock options, hardware stipend",
    recruiterNotes: null,
    customNotes: "Applied over 2 months ago. Job posting is still up but no response.",
  },
  {
    title: "Backend Developer",
    company: "OmniRetail",
    location: "Baltimore, MD",
    stage: "REJECTED" as const,
    priority: false,
    description: "E-commerce inventory management platform",
    applicationDate: new Date("2026-02-14"),
    deadline: null,
    compensationNotes: "Base: $150k–$170k",
    recruiterNotes: "Rejected after technical screen — said I struggled with SQL join questions",
    customNotes: "They were right, I blanked on a window function. Need to practice SQL more.",
  },
  {
    title: "Site Reliability Engineer",
    company: "CoreStack",
    location: "New York, NY",
    stage: "GHOSTED" as const,
    priority: false,
    description: "Cloud infrastructure reliability and observability",
    applicationDate: new Date("2026-02-10"),
    deadline: null,
    compensationNotes: "Base: $190k–$220k, RSUs, on-call pay",
    recruiterNotes: null,
    customNotes: "Applied over 2 months ago. Role might have been put on hold.",
  },
  {
    title: "Software Engineer",
    company: "ByteWise Consulting",
    location: "Hartford, CT",
    stage: "REJECTED" as const,
    priority: false,
    description: "Technical consulting for insurance clients",
    applicationDate: new Date("2026-02-08"),
    deadline: null,
    compensationNotes: "Base: $160k–$180k, billable hours model",
    recruiterNotes: "Said they needed someone with consulting background. Fair enough.",
    customNotes: "Consulting isn't really my thing anyway. No love lost.",
  },
  {
    title: "Backend Developer",
    company: "OmniPay",
    location: "Philadelphia, PA",
    stage: "GHOSTED" as const,
    priority: false,
    description: "Payment processing gateway services",
    applicationDate: new Date("2026-02-03"),
    deadline: null,
    compensationNotes: "Base: $175k–$200k, equity, annual bonus",
    recruiterNotes: null,
    customNotes: "Applied over 2 months ago. Website says 'still hiring' but no response.",
  },
  {
    title: "Frontend Developer",
    company: "AdTech Global",
    location: "Remote",
    stage: "ARCHIVED" as const,
    priority: false,
    description: "Ad campaign management dashboard",
    applicationDate: new Date("2026-01-15"),
    deadline: null,
    compensationNotes: "Base: $140k–$160k",
    recruiterNotes: null,
    customNotes: "Ad tech isn't interesting to me. Archived to clean up the pipeline.",
  },
  {
    title: "QA Engineer",
    company: "TestRite Co",
    location: "Trenton, NJ",
    stage: "ARCHIVED" as const,
    priority: false,
    description: "Automated regression testing for healthcare platform",
    applicationDate: new Date("2026-01-10"),
    deadline: null,
    compensationNotes: "Base: $120k–$140k",
    recruiterNotes: null,
    customNotes: "Early cycle application. Decided QA isn't the direction I want to go.",
  },
  {
    title: "Software Developer",
    company: "MegaCorp Legacy",
    location: "New Brunswick, NJ",
    stage: "ARCHIVED" as const,
    priority: false,
    description: "Maintaining legacy Java monolith for telecom",
    applicationDate: new Date("2026-01-05"),
    deadline: null,
    compensationNotes: "Base: $145k–$165k, pension, 401k match",
    recruiterNotes: null,
    customNotes: "Applied in January out of desperation. Wouldn't take it now even if they responded.",
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
        title: "E-Commerce Platform",
        organization: null,
        location: null,
        startDate: new Date("2024-06-01"),
        endDate: new Date("2024-11-01"),
        isCurrent: false,
        description:
          "Full stack e-commerce application with product catalog, cart, checkout, and Stripe payment integration. Built with Next.js 14, TypeScript, PostgreSQL, and Prisma. Tailwind CSS for responsive UI. Supports 500+ concurrent users with server-side rendering and edge caching.",
        order: 2,
      },
      {
        type: "PROJECT",
        title: "Inventory Management API",
        organization: null,
        location: null,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-05-01"),
        isCurrent: false,
        description:
          "RESTful inventory management service built with Java and Spring Boot. PostgreSQL backend with JPA/Hibernate for data access, Docker containerization, and JUnit test suite with 90% code coverage. Handles 5k+ SKU lookups/sec with connection pooling.",
        order: 3,
      },
      {
        type: "PROJECT",
        title: "Developer Portfolio CMS",
        organization: null,
        location: null,
        startDate: new Date("2023-07-01"),
        endDate: new Date("2023-12-01"),
        isCurrent: false,
        description:
          "Headless CMS for developer portfolios with markdown editing, image uploads, and full-text search. React frontend with MongoDB document storage and Express API. Deployed on Vercel with 99.9% uptime. Used by 200+ developers.",
        order: 4,
      },
      {
        type: "PROJECT",
        title: "Task Automation CLI",
        organization: null,
        location: null,
        startDate: new Date("2023-01-01"),
        endDate: new Date("2023-06-01"),
        isCurrent: false,
        description:
          "Open-source CLI tool for automating development workflows — scaffolding, linting, and deployment scripts. Written in TypeScript with 500+ GitHub stars. Comprehensive test suite using Jest and Vitest with 95% coverage. Plugin system for custom task definitions.",
        order: 5,
      },
      {
        type: "PROJECT",
        title: "Admin Dashboard",
        organization: null,
        location: null,
        startDate: new Date("2022-06-01"),
        endDate: new Date("2022-12-01"),
        isCurrent: false,
        description:
          "Responsive admin dashboard with data tables, charts, CSV export, and role-based access control. Built with React and Bootstrap 5 for cross-browser compatibility. Node.js/Express backend with GraphQL API connecting to PostgreSQL.",
        order: 6,
      },
      {
        type: "PROJECT",
        title: "URL Shortener Service",
        organization: null,
        location: null,
        startDate: new Date("2022-01-01"),
        endDate: new Date("2022-05-01"),
        isCurrent: false,
        description:
          "RESTful URL shortener with click tracking, geo-analytics, and custom aliases. Node.js/Express backend with PostgreSQL. Containerized with Docker, deployed behind Nginx. Full endpoint test suite with Vitest covering auth, rate limiting, and edge cases.",
        order: 7,
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
      { name: "JavaScript", category: "Languages", proficiency: "Advanced", order: 1 },
      { name: "Java", category: "Languages", proficiency: "Intermediate", order: 2 },
      { name: "React", category: "Frameworks", proficiency: "Advanced", order: 3 },
      { name: "Next.js", category: "Frameworks", proficiency: "Advanced", order: 4 },
      { name: "Node.js", category: "Runtime", proficiency: "Advanced", order: 5 },
      { name: "Express", category: "Frameworks", proficiency: "Advanced", order: 6 },
      { name: "Tailwind CSS", category: "Frameworks", proficiency: "Advanced", order: 7 },
      { name: "Bootstrap", category: "Frameworks", proficiency: "Intermediate", order: 8 },
      { name: "GraphQL", category: "API", proficiency: "Intermediate", order: 9 },
      { name: "PostgreSQL", category: "Databases", proficiency: "Intermediate", order: 10 },
      { name: "MongoDB", category: "Databases", proficiency: "Intermediate", order: 11 },
      { name: "Docker", category: "DevOps", proficiency: "Intermediate", order: 12 },
      { name: "Git", category: "DevOps", proficiency: "Advanced", order: 13 },
      { name: "Jest", category: "Testing", proficiency: "Advanced", order: 14 },
      { name: "Vitest", category: "Testing", proficiency: "Advanced", order: 15 },
    ],
  },
  [USER_B]: {
    firstName: "Jordan",
    lastName: "Kim",
    email: "jordan.kim@email.com",
    phone: "(555) 987-6543",
    location: "Newark, NJ",
    headline: "Senior Platform Engineer",
    summary:
      "Platform engineer with 6+ years of experience in distributed systems, cloud infrastructure, and developer tooling. Focused on building reliable, scalable backend systems. AWS certified with deep Kubernetes expertise.",
    targetRoles: ["Staff Engineer", "Platform Engineer", "Backend Lead", "DevOps Engineer"],
    targetLocations: ["New York, NY", "Jersey City, NJ", "Philadelphia, PA", "Remote"],
    workModePreference: "Hybrid",
    salaryPreference: 200000,
    experiences: [
      {
        type: "EMPLOYMENT",
        title: "Senior Backend Engineer",
        organization: "CloudScale Systems",
        location: "New York, NY",
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
        location: "Philadelphia, PA",
        startDate: new Date("2018-07-01"),
        endDate: new Date("2021-02-01"),
        isCurrent: false,
        description:
          "Built real-time data processing pipelines using Kafka and Go. Designed and implemented a custom job scheduler handling 100k+ scheduled tasks daily.",
        order: 1,
      },
      {
        type: "PROJECT",
        title: "Distributed Task Scheduler",
        organization: null,
        location: null,
        startDate: new Date("2024-07-01"),
        endDate: new Date("2024-12-01"),
        isCurrent: false,
        description:
          "High-throughput distributed job scheduler built in Go with etcd-based leader election and gRPC communication. Processes 50k+ jobs/min across a 10-node Kubernetes cluster. Deployed via Helm charts with Prometheus metrics and Grafana dashboards for monitoring.",
        order: 2,
      },
      {
        type: "PROJECT",
        title: "Kubernetes Cost Optimizer",
        organization: null,
        location: null,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-06-01"),
        isCurrent: false,
        description:
          "CLI tool written in Go that analyzes Kubernetes resource usage via Prometheus API and generates rightsizing recommendations. Outputs cost savings estimates. Reduced mock cluster spend by 30%. CI/CD pipeline with GitHub Actions for automated testing and releases.",
        order: 3,
      },
      {
        type: "PROJECT",
        title: "Event-Driven Order Pipeline",
        organization: null,
        location: null,
        startDate: new Date("2023-06-01"),
        endDate: new Date("2023-12-01"),
        isCurrent: false,
        description:
          "Microservices order processing system using Kafka Streams for event sourcing. Go services for inventory, payment, and fulfillment orchestration communicating via gRPC. PostgreSQL for state, deployed on Kubernetes with Helm charts and Terraform IaC.",
        order: 4,
      },
      {
        type: "PROJECT",
        title: "Infrastructure-as-Code Platform",
        organization: null,
        location: null,
        startDate: new Date("2023-01-01"),
        endDate: new Date("2023-05-01"),
        isCurrent: false,
        description:
          "Web platform for managing Terraform modules across multi-cloud environments (AWS, GCP). Python/FastAPI backend with PostgreSQL. Bash scripts for bootstrapping environments and running validation checks. Supports module versioning, cost estimation, and drift detection.",
        order: 5,
      },
      {
        type: "PROJECT",
        title: "Real-Time Log Aggregator",
        organization: null,
        location: null,
        startDate: new Date("2022-06-01"),
        endDate: new Date("2022-12-01"),
        isCurrent: false,
        description:
          "Log aggregation pipeline ingesting 100k+ events/sec via Kafka, processed with Go consumers, stored in Redis cache and ClickHouse. Grafana dashboards for querying with sub-second latency. AWS deployment with Terraform. Docker containers orchestrated with Kubernetes.",
        order: 6,
      },
      {
        type: "PROJECT",
        title: "API Gateway & Rate Limiter",
        organization: null,
        location: null,
        startDate: new Date("2022-01-01"),
        endDate: new Date("2022-05-01"),
        isCurrent: false,
        description:
          "Custom API gateway in Go with token-bucket rate limiting, JWT authentication, and request routing. Redis-backed rate counters with distributed locking. Docker-based CI/CD pipeline with automated integration tests. Benchmarked at 25k req/sec with p99 latency under 10ms.",
        order: 7,
      },
    ],
    educations: [
      {
        institution: "Columbia University",
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
      { name: "Bash", category: "Languages", proficiency: "Advanced", order: 2 },
      { name: "Kubernetes", category: "Infrastructure", proficiency: "Advanced", order: 3 },
      { name: "Docker", category: "Infrastructure", proficiency: "Advanced", order: 4 },
      { name: "Terraform", category: "Infrastructure", proficiency: "Advanced", order: 5 },
      { name: "AWS", category: "Cloud", proficiency: "Advanced", order: 6 },
      { name: "GCP", category: "Cloud", proficiency: "Intermediate", order: 7 },
      { name: "Kafka", category: "Messaging", proficiency: "Advanced", order: 8 },
      { name: "gRPC", category: "API", proficiency: "Advanced", order: 9 },
      { name: "PostgreSQL", category: "Databases", proficiency: "Advanced", order: 10 },
      { name: "Redis", category: "Databases", proficiency: "Advanced", order: 11 },
      { name: "Prometheus", category: "Monitoring", proficiency: "Advanced", order: 12 },
      { name: "Grafana", category: "Monitoring", proficiency: "Advanced", order: 13 },
      { name: "Helm", category: "Infrastructure", proficiency: "Intermediate", order: 14 },
      { name: "CI/CD", category: "DevOps", proficiency: "Advanced", order: 15 },
    ],
  },
};

const SEED_DOCUMENTS: Record<string, { type: "RESUME" | "COVER_LETTER"; name: string; content: string; jobIndex: number }[]> = {
  [USER_A]: [
    {
      type: "RESUME",
      name: "Full Stack Engineer - TechCorp",
      jobIndex: 12,
      content: `<h1>John Doe</h1>
<div class="section headerInfo">

john.doe@email.com | (555) 123-4567 | San Francisco, CA

</div>

### Education

### New Jersey Institute of Technology <span class="spacer"></span><span class="normal"></span>
*B.S., Computer Science | GPA: 3.7* <span class="spacer"></span><span class="normal">*Sep 2016 - May 2020*</span>

### Hudson County Community College <span class="spacer"></span><span class="normal"></span>
*A.S., Computer Science | GPA: 3.8* <span class="spacer"></span><span class="normal">*Sep 2014 - May 2016*</span>

### Experience

### Software Engineer <span class="spacer"></span><span class="normal">Jun 2022 - Present</span>
*TechNova Inc.* <span class="tech-stack">| TypeScript, React, Node.js, GraphQL, PostgreSQL, AWS</span> <span class="spacer"></span><span class="normal">*San Francisco, CA*</span>
- Developed and maintained a full-stack B2B SaaS platform serving 50k+ users, ensuring high availability and performance for enterprise clients.
- Led the migration of critical API endpoints from REST to GraphQL, successfully reducing API payload sizes by 40% and improving data fetching efficiency.
- Mentored 2 junior engineers, fostering their growth in full-stack development, code quality, and best practices.

### Junior Developer <span class="spacer"></span><span class="normal">Aug 2020 - May 2022</span>
*WebForge LLC* <span class="tech-stack">| React, TypeScript, Node.js, Express, PostgreSQL, AWS</span> <span class="spacer"></span><span class="normal">*New York, NY*</span>
- Built and maintained responsive, client-facing dashboards using React and TypeScript, enhancing user experience for data visualization.
- Implemented automated CI/CD pipelines, integrating testing and deployment processes that reduced deployment time by 60%.

### Projects

### Inventory Management API <span class="tech-stack">| Java, Spring Boot, PostgreSQL, Docker</span> <span class="spacer"></span><span class="normal">Jan 2024 - May 2024</span>
- Developed a RESTful inventory management service using Java and Spring Boot for high throughput data operations.
- Implemented PostgreSQL backend with JPA/Hibernate, handling 5k+ SKU lookups/sec.
- Docker containerization with JUnit test suite achieving 90% code coverage.

### E-Commerce Platform <span class="tech-stack">| Next.js 14, TypeScript, PostgreSQL, Prisma</span> <span class="spacer"></span><span class="normal">Jun 2024 - Nov 2024</span>
- Engineered a full-stack e-commerce application featuring product catalog, cart, checkout, and Stripe payment integration, demonstrating end-to-end system design.
- Leveraged Next.js 14, TypeScript, and PostgreSQL with Prisma for a scalable and performant solution supporting 500+ concurrent users through server-side rendering and edge caching.
- Designed a responsive UI with Tailwind CSS, ensuring optimal user experience across various devices.

### Technical Skills

**Languages:** Java, TypeScript, JavaScript, PostgreSQL, MongoDB

**Frameworks:** React, Spring Boot, Next.js, Node.js, Express, GraphQL

**Tools:** Docker, Git, Jest, Vitest

**Concepts:** RESTful APIs, Microservices, CI/CD, OOP`,
    },
    {
      type: "COVER_LETTER",
      name: "Iceberg Data - Java Full Stack",
      jobIndex: 31,
      content: `<h1>John Doe</h1>
<div class="section headerInfo">

john.doe@email.com | (555) 123-4567 | San Francisco, CA

</div>

April 20, 2026

Iceberg Data

Dear Hiring Manager,

I am writing to express my enthusiastic interest in the Java Full Stack Developer position at **Iceberg Data**, as advertised. The opportunity to contribute to an enterprise data platform with a focus on both Java backend and React frontend development is particularly compelling, aligning perfectly with my skill set and passion for building robust, scalable web applications. My 4+ years of experience in full stack development, combined with a strong background in both modern frontend technologies and Java backend systems, makes me confident I can make an immediate and significant contribution to your team.

My experience includes hands-on development of high-performance backend services, most notably a RESTful Inventory Management API built with **Java** and **Spring Boot**. This project leveraged **PostgreSQL** with JPA/Hibernate, was containerized with Docker, and featured a comprehensive JUnit test suite with 90% code coverage, efficiently handling 5k+ SKU lookups/sec. At TechNova Inc., I led a critical migration from REST to GraphQL for a B2B SaaS platform, which successfully reduced API payload size by 40% and improved developer experience, while also mentoring junior engineers. This experience demonstrates my capability in optimizing backend performance and driving significant architectural improvements.

Complementing my backend strengths, I possess extensive experience with modern frontend technologies, including **React**, TypeScript, and Next.js, as evidenced by my work on an E-Commerce Platform and various client-facing dashboards. At WebForge LLC, I was instrumental in implementing automated CI/CD pipelines that reduced deployment time by 60%, showcasing my commitment to efficient development workflows and continuous improvement. I am passionate about clean architecture, ensuring a seamless integration between frontend and backend, and shipping products that solve real problems for users, all qualities I believe are essential for an enterprise data platform like **Iceberg Data**.

I am confident that my blend of Java backend expertise and modern React frontend skills, combined with a passion for clean architecture and shipping impactful products, aligns perfectly with the requirements for your enterprise data platform. I look forward to the opportunity to discuss my qualifications further and learn more about how I can contribute to **Iceberg Data**'s success. Thank you for your time and consideration.

Sincerely,

John Doe`,
    },
  ],
  [USER_B]: [
    {
      type: "RESUME",
      name: "Senior Platform Engineer - GrowthLabs",
      jobIndex: 16,
      content: `<h1>Jordan Kim</h1>
<div class="section headerInfo">

jordan.kim@email.com | (555) 987-6543 | Newark, NJ

</div>

### Education

### Columbia University <span class="spacer"></span><span class="normal"></span>
*M.S., Computer Science | GPA: 3.9* <span class="spacer"></span><span class="normal">*Sep 2016 - Jun 2018*</span>

### Rutgers University <span class="spacer"></span><span class="normal"></span>
*B.S., Computer Engineering | GPA: 3.6* <span class="spacer"></span><span class="normal">*Sep 2012 - May 2016*</span>

### Experience

### Senior Backend Engineer <span class="spacer"></span><span class="normal">Mar 2021 - Present</span>
*CloudScale Systems* <span class="tech-stack">| Go, Kubernetes, AWS, Kafka</span> <span class="spacer"></span><span class="normal">*New York, NY*</span>
- Architected event-driven microservices processing 10M+ events/day for real-time data pipelines.
- Reduced infrastructure costs by 35% through right-sizing and spot instance optimization.
- Led on-call rotation for critical services maintaining 99.99% uptime.

### Backend Developer <span class="spacer"></span><span class="normal">Jul 2018 - Feb 2021</span>
*DataPipe Corp* <span class="tech-stack">| Go, Kafka, gRPC, PostgreSQL</span> <span class="spacer"></span><span class="normal">*Philadelphia, PA*</span>
- Built real-time data processing pipelines using Kafka and Go for high-throughput streaming.
- Designed and implemented a custom job scheduler handling 100k+ scheduled tasks daily.

### Projects

### Distributed Task Scheduler <span class="tech-stack">| Go, etcd, Kubernetes, Helm</span> <span class="spacer"></span><span class="normal">Jul 2024 - Dec 2024</span>
- High-throughput distributed job scheduler built in Go with etcd-based leader election.
- Processes 50k+ jobs/min across a 10-node Kubernetes cluster.

### Kubernetes Cost Optimizer <span class="tech-stack">| Go, Prometheus, Terraform</span> <span class="spacer"></span><span class="normal">Jan 2024 - Jun 2024</span>
- CLI tool analyzing Kubernetes resource usage via Prometheus API.
- Achieved 30% cost reduction through rightsizing recommendations.

### Technical Skills

**Languages:** Go, Python, Bash, TypeScript

**Infra:** Kubernetes, Docker, Terraform, AWS, GCP

**Messaging:** Kafka, gRPC, REST

**Databases:** PostgreSQL, Redis

**Monitoring:** Prometheus, Grafana`,
    },
    {
      type: "COVER_LETTER",
      name: "GrowthLabs - Staff Engineer",
      jobIndex: 16,
      content: `<h1>Jordan Kim</h1>
<div class="section headerInfo">

jordan.kim@email.com | (555) 987-6543 | Newark, NJ

</div>

April 20, 2026

GrowthLabs

Dear Hiring Manager,

I am excited to apply for the Staff Software Engineer position at GrowthLabs. With 6+ years of experience in distributed systems, cloud infrastructure, and developer tooling, I am particularly drawn to GrowthLabs' mission of building scalable microservices platforms. My track record of architecting systems that process 10M+ events daily, combined with deep expertise in Kubernetes, AWS, and event-driven architectures, positions me to make an immediate impact on your platform team.

At CloudScale Systems, I architected event-driven microservices that process over 10 million events per day for our real-time data pipelines. This role required deep expertise in Kubernetes, AWS, and modern observability practices. I also led infrastructure cost optimization initiatives that reduced our AWS spend by 35% through strategic spot instance usage and right-sizing. Previously at DataPipe Corp, I built real-time data processing pipelines using Kafka and Go, designing a custom job scheduler that handles over 100,000 scheduled tasks daily.

I have a proven ability to bridge the gap between infrastructure and application development. My Kubernetes Cost Optimizer project demonstrates this—it's a CLI tool that analyzes resource usage patterns and generates rightsizing recommendations, achieving 30% cost reductions for users. I believe these experiences align well with GrowthLabs' goals of building a performant, cost-effective platform.

I would welcome the opportunity to discuss how my background in distributed systems and infrastructure engineering can contribute to GrowthLabs' growth. Thank you for your time and consideration.

Sincerely,

Jordan Kim`,
    },
  ],
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
  GHOSTED: [
    { from: null, to: "APPLIED" },
    { from: "APPLIED", to: "GHOSTED" },
  ],
  ARCHIVED: [
    { from: null, to: "APPLIED" },
    { from: "APPLIED", to: "ARCHIVED" },
  ],
  INTERESTED: [{ from: null, to: "INTERESTED" }],
};

const STAGE_LABELS: Record<string, string> = {
  INTERESTED: "Interested",
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
  GHOSTED: "Ghosted",
  ARCHIVED: "Archived",
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

const expCreates = data.experiences.map((exp) =>
    prisma.experience.create({ data: { profileId: profile.id, ...exp } })
  );
  const eduCreates = data.educations.map((edu) =>
    prisma.education.create({ data: { profileId: profile.id, ...edu } })
  );
  const skillCreates = data.skills.map((skill) =>
    prisma.skill.create({ data: { profileId: profile.id, ...skill } })
  );
  await prisma.$transaction([...expCreates, ...eduCreates, ...skillCreates]);

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

  const createdJobs = await prisma.$transaction(
    jobs.map((jobData) =>
      prisma.job.create({
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
      })
    )
  );

  const stageHistoryCreates: Parameters<typeof prisma.jobStageHistory.create>[0][] = [];
  const activityCreates: Parameters<typeof prisma.jobActivity.create>[0][] = [];

  for (let idx = 0; idx < createdJobs.length; idx++) {
    const job = createdJobs[idx];
    const jobData = jobs[idx];
    const transitions = STAGE_TRANSITIONS[jobData.stage] ?? [{ from: null, to: jobData.stage }];
    const baseDate = jobData.applicationDate ?? new Date("2026-03-01");

    for (let i = 0; i < transitions.length; i++) {
      const t = transitions[i];
      stageHistoryCreates.push({
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
        activityCreates.push({
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
      activityCreates.push({
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
      activityCreates.push({
        data: {
          jobId: job.id,
          type: "INTERVIEW",
          title: "Onsite Interview Loop",
          description: "Full day: 4 rounds including system design, coding, behavioral, and hiring manager",
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
      activityCreates.push({
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

    activityCreates.push({
      data: {
        jobId: job.id,
        type: "NOTE",
        title: "Application submitted",
        description: `Applied to ${jobData.company} for ${jobData.title} position`,
        createdAt: baseDate,
      },
    });
  }

  await prisma.$transaction([
    ...stageHistoryCreates.map((data) => prisma.jobStageHistory.create(data)),
    ...activityCreates.map((data) => prisma.jobActivity.create(data)),
  ]);

  for (const job of createdJobs) {
    console.log(`  ✅ Created: ${job.title} at ${job.company} (${job.stage})`);
  }
}

type SeedDocument = {
  type: "RESUME" | "COVER_LETTER";
  name: string;
  content: string;
  jobIndex: number;
};

async function seedDocuments(userId: string, documents: SeedDocument[], userLabel: string) {
  console.log(`\n🌱 Seeding ${documents.length} documents for ${userLabel}`);

  const jobs = await prisma.job.findMany({
    where: { userId },
    orderBy: { applicationDate: "desc" },
    select: { id: true },
  });

  const createdDocs = await prisma.$transaction(
    documents.map((docData) =>
      prisma.document.create({
        data: {
          userId,
          type: docData.type,
          name: docData.name,
          category: docData.type === "RESUME" ? "Resume" : "Cover Letter",
          status: "DRAFT",
        },
      })
    )
  );

  const versions = await prisma.$transaction(
    createdDocs.map((doc, idx) =>
      prisma.documentVersion.create({
        data: { documentId: doc.id, versionNumber: 1, content: documents[idx].content },
      })
    )
  );

  const linkCreates: Parameters<typeof prisma.jobDocumentLink.create>[0][] = [];
  for (let idx = 0; idx < documents.length; idx++) {
    const job = jobs[documents[idx].jobIndex];
    if (job) {
      linkCreates.push({
        data: {
          jobId: job.id,
          documentId: createdDocs[idx].id,
          documentVersionId: versions[idx].id,
        },
      });
    }
  }

  if (linkCreates.length > 0) {
    await prisma.$transaction(linkCreates.map((data) => prisma.jobDocumentLink.create(data)));
  }

  for (const doc of createdDocs) {
    console.log(`  ✅ Created: ${doc.name}`);
  }
}

async function main() {
  console.log("=== Dartly Demo Seed Script ===");

  await Promise.all([
    seedProfile(USER_A, "User A"),
    seedProfile(USER_B, "User B"),
  ]);

  await Promise.all([
    seedJobs(USER_A, USER_A_JOBS, "User A"),
    seedJobs(USER_B, USER_B_JOBS, "User B"),
  ]);

  await Promise.all([
    seedDocuments(USER_A, SEED_DOCUMENTS[USER_A], "User A"),
    seedDocuments(USER_B, SEED_DOCUMENTS[USER_B], "User B"),
  ]);

  const counts = {
    jobs: await prisma.job.count(),
    profiles: await prisma.profile.count(),
    experiences: await prisma.experience.count(),
    educations: await prisma.education.count(),
    skills: await prisma.skill.count(),
    activities: await prisma.jobActivity.count(),
    stageHistory: await prisma.jobStageHistory.count(),
    documents: await prisma.document.count({ where: { isDeleted: false } }),
    documentVersions: await prisma.documentVersion.count(),
    jobDocumentLinks: await prisma.jobDocumentLink.count(),
  };

  console.log("\n✨ Seed complete!");
  console.log("   Summary:");
  console.log(`   Jobs:              ${counts.jobs}`);
  console.log(`   Profiles:          ${counts.profiles}`);
  console.log(`   Experiences:       ${counts.experiences}`);
  console.log(`   Educations:        ${counts.educations}`);
  console.log(`   Skills:            ${counts.skills}`);
  console.log(`   Activities:        ${counts.activities}`);
  console.log(`   Stage History:     ${counts.stageHistory}`);
  console.log(`   Documents:         ${counts.documents}`);
  console.log(`   Document Versions: ${counts.documentVersions}`);
  console.log(`   Job-Doc Links:       ${counts.jobDocumentLinks}`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
