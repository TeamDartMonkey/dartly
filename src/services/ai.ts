import "server-only";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/lib/env";
import type { ProfileData } from "@/types/profile";

type JobContext = {
  title: string;
  company: string;
  description?: string;
};

type GenerateResult = {
  content: string;
};

// Lazily construct the Gemini client so a missing API key produces a clear
// error from a single place rather than a confusing failure on first call.
let cachedModel: ReturnType<GoogleGenerativeAI["getGenerativeModel"]> | null = null;

function getModel() {
  if (cachedModel) return cachedModel;
  if (!env.GEMINI_API_KEY) {
    throw new Error("AI is not configured (GEMINI_API_KEY missing)");
  }
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  cachedModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  return cachedModel;
}

const MAX_RETRIES = 1;
const GENERATE_TIMEOUT_MS = 30_000;

// Cap parsed retry delays so a malformed upstream message can't pin the route
// open for hours.
const MAX_RETRY_DELAY_MS = 30_000;

function parseRetryDelay(error: unknown): number | null {
  if (error instanceof Error) {
    const match = error.message.match(/retryDelay["':\s]+(\d+)s/i);
    if (match) {
      const ms = Number.parseInt(match[1], 10) * 1000;
      return Math.min(ms, MAX_RETRY_DELAY_MS);
    }
  }
  return null;
}

function isRetryable(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return msg.includes("503") || msg.includes("429") || msg.includes("overloaded");
  }
  return false;
}

// Wrap a promise with a timeout so a hung Gemini call cannot pin the route.
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("AI generation timed out")), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      }
    );
  });
}

async function generateWithRetry(prompt: string): Promise<string> {
  let attempt = 0;
  while (true) {
    try {
      const result = await withTimeout(getModel().generateContent(prompt), GENERATE_TIMEOUT_MS);
      const text = result.response.text();
      if (!text || text.trim().length === 0) {
        throw new Error("AI generation returned empty response");
      }
      return text.trim();
    } catch (error) {
      if (error instanceof Error && error.message === "AI generation returned empty response") {
        throw error;
      }
      if (attempt < MAX_RETRIES && isRetryable(error)) {
        const delay = parseRetryDelay(error) ?? 2000 * (attempt + 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
        attempt += 1;
        continue;
      }
      throw new Error(
        `AI generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

function serializeProfile(profile: ProfileData): string {
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Unknown";
  const contactParts = [
    profile.email,
    profile.phone,
    profile.location,
    ...(profile.professionalLinks ? Object.values(profile.professionalLinks) : []),
  ].filter(Boolean);

  let out = `Name: ${name}\n`;
  if (contactParts.length > 0) out += `Contact: ${contactParts.join(" | ")}\n`;
  if (profile.headline) out += `Headline: ${profile.headline}\n`;
  if (profile.summary) out += `Summary: ${profile.summary}\n`;

  if (profile.experiences.length > 0) {
    out += "\nExperiences:\n";
    for (const exp of profile.experiences) {
      const dates = [exp.startDate, exp.isCurrent ? "Present" : exp.endDate]
        .filter(Boolean)
        .join(" - ");
      out += `- [${exp.type}] ${exp.title} at ${exp.organization}${exp.location ? ` (${exp.location})` : ""} (${dates})\n`;
      if (exp.description) out += `  ${exp.description}\n`;
    }
  }

  if (profile.educations.length > 0) {
    out += "\nEducation:\n";
    for (const edu of profile.educations) {
      const degree = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(", ");
      out += `- ${degree} at ${edu.institution} (${edu.startDate} - ${edu.endDate})\n`;
      if (edu.gpa) out += `  GPA: ${edu.gpa}\n`;
    }
  }

  if (profile.skills.length > 0) {
    out += `\nSkills: ${profile.skills.map((s) => s.name).join(", ")}\n`;
  }

  return out;
}

const RESUME_FORMAT_EXAMPLE = `# John Doe
<div class="section headerInfo">

[john.doe@gmail.com](mailto:john.doe@gmail.com) | (123) 456-7890 | [LinkedIn](https://linkedin.com/in/johndoe) | [GitHub](https://github.com/johndoe)

</div>

### Education

### Massachusetts Institute of Technology <span class="spacer"></span><span class="normal">Cambridge, MA</span>
*Bachelor of Science in Computer Science | GPA: 3.9/4.0* <span class="spacer"></span><span class="normal">*Aug 2019 - May 2023*</span>
- Relevant Coursework: Data Structures & Algorithms, Operating Systems, Database Systems, Computer Networks

### Experience

### Software Engineer <span class="spacer"></span><span class="normal">May 2023 - Present</span>
*Google* <span class="tech-stack">| Python, Go, Kubernetes, Apache Kafka, GCP</span> <span class="spacer"></span><span class="normal">*New York, NY*</span>
- Led development of a real-time data processing pipeline, improving throughput by 40%
- Architected and deployed microservices handling 10M+ requests per day

### Projects

### Open Source CLI Tool <span class="tech-stack">| Rust, Docker, GitHub Actions</span> <span class="spacer"></span><span class="normal">Jan 2023 - Apr 2023</span>
- Built a command-line tool for automating deployment workflows with 500+ GitHub stars
- Implemented plugin system for extensible workflow customization

### Technical Skills
**Languages & Databases:** Python, JavaScript, TypeScript, Go, Rust, MySQL, PostgreSQL<br>
**Frameworks & Libraries:** React, Node.js, Express, Next.js, Docker, Kubernetes, GraphQL<br>
**Developer Tools:** Git, Postman, Jupyter Notebook<br>
**Concepts:** RESTful APIs, Microservices, CI/CD, Agile/Scrum, OOP, Design Patterns, System Design`;

const RESUME_FORMAT_RULES = `- Sections must appear in this order: Education, Experience, Projects, Technical Skills
- Every section heading (Education, Experience, Projects, Technical Skills) MUST be "### " (three hashes + space)
- Education entries: "### Institution <span class="spacer"></span><span class="normal">Location</span>" on the first line, then the next line "*Degree | GPA: X.X* <span class="spacer"></span><span class="normal">*Date*</span>" using italic — the degree line must be a separate paragraph below the institution title
- Education entries can include bullet points for Relevant Coursework or Awards below the degree line
- Experience entries: "### Job Title <span class="spacer"></span><span class="normal">Date Range</span>" on the first line, then "*Company* <span class="tech-stack">| Tech, Stack</span> <span class="spacer"></span><span class="normal">*Location*</span>" on the second line using italic
- Project entries: "### Project Name <span class="tech-stack">| Tech, Stack</span> <span class="spacer"></span><span class="normal">Date Range</span>" — tech stack goes inline with the project title, no second line
- Technical Skills: separate each category onto its own line with bold labels:
  "**Languages:** ..." on one line
  "**Frameworks:** ..." on the next line
  "**Tools:** ..." on the next line
  "**Concepts:** ..." on the final line
- IMPORTANT: Keep tech stacks SHORT — max 40 characters total for EXPERIENCE lines, max 35 characters for PROJECT tech stacks. Prioritize the 2-4 most important technologies, NOT everything.
- Technical Skills section: max 10 items per category, use commas (not line breaks)
- Use "- " bullet points for descriptions
- Contact info goes in <div class="section headerInfo"> block after the name
- Do NOT wrap output in markdown code fences
- Output ONLY valid Markdown with inline HTML — no plain text headings`;

export async function generateResumeDraft(
  profile: ProfileData,
  job: JobContext
): Promise<GenerateResult> {
  const prompt = `You are an expert resume writer. Generate a professional resume tailored to the target job using Jake's Resume format.

TARGET JOB:
Title: ${job.title}
Company: ${job.company}${job.description ? `\nDescription: ${job.description}` : ""}

CANDIDATE PROFILE:
${serializeProfile(profile)}

FORMAT EXAMPLE (Jake's Resume — hybrid Markdown + HTML):
${RESUME_FORMAT_EXAMPLE}

FORMAT RULES:
${RESUME_FORMAT_RULES}

Tailoring instructions:
- Select the 2-4 most relevant projects from the candidate's profile that align with the target job's tech stack and domain. Do NOT list every project — only those that strengthen the application.
- Reorder projects so the most relevant one appears first in the Projects section.
- Rewrite project and experience bullet points to emphasize skills, technologies, and achievements that match the target job description.
- If the target job emphasizes frontend work, prioritize frontend projects and rephrase bullets to highlight UI/UX impact. If it emphasizes backend or infrastructure, prioritize those projects accordingly.
- Output ONLY the resume content in Jake's format. No preamble, no explanation, no markdown code fences.`;

  const content = await generateWithRetry(prompt);
  return { content };
}

export async function generateCoverLetterDraft(
  profile: ProfileData,
  job: JobContext
): Promise<GenerateResult> {
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Your Name";
  const contactParts = [profile.email, profile.phone, profile.location].filter(Boolean);

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const COVER_LETTER_FORMAT_EXAMPLE = `# ${name}
<div class="section headerInfo">

${contactParts.join(" | ")}

</div>

${currentDate}

${job.company}

Dear Hiring Manager,

[Opening paragraph — express enthusiasm for the role and company, mention the position title]

[Middle paragraph(s) — connect experience and skills to the job requirements, highlight specific achievements with quantified impact]

[Closing paragraph — restate interest, include a call to action, thank the reader]

Sincerely,

${name}`;

  const prompt = `You are an expert cover letter writer. Generate a professional, compelling cover letter using the format below.

TARGET JOB:
Title: ${job.title}
Company: ${job.company}${job.description ? `\nDescription: ${job.description}` : ""}

CANDIDATE PROFILE:
${serializeProfile(profile)}

FORMAT EXAMPLE:
${COVER_LETTER_FORMAT_EXAMPLE}

FORMAT RULES:
- Name must be "# " (h1 heading) — this renders large and centered
- Contact info goes in a <div class="section headerInfo"> block right after the name, with email, phone, and location separated by " | "
- Date is already set to today (${currentDate}) — use it exactly as shown
- Company name on its own line after the date
- Salutation: "Dear Hiring Manager," (or a specific name if known from the job description)
- 3-4 body paragraphs that:
  - Open with genuine enthusiasm for the specific role and company
  - Connect the candidate's experience directly to the job requirements
  - Highlight specific achievements with quantified impact (numbers, percentages, user counts)
  - Close with confidence, a call to action, and appreciation for the reader's time
- Professional closing: "Sincerely," on its own line, then the candidate's name on the next line
- Do NOT use bullet points or lists — cover letters are prose paragraphs only
- Keep the letter to one page (250-400 words)
- Use **bold** sparingly for key terms or company names
- Output ONLY the cover letter content, no preamble, no explanation, no markdown code fences
- Candidate's name to use: ${name}`;

  const content = await generateWithRetry(prompt);
  return { content };
}

type RewriteInput = {
  content: string;
  instruction: string;
};

export async function rewriteContent(input: RewriteInput): Promise<GenerateResult> {
  const prompt = `You are an expert editor. Rewrite the following content based on the user's instruction.

USER INSTRUCTION: ${input.instruction}

IMPORTANT RULES:
- Preserve the original format exactly (if it contains HTML spans like Jake's Resume format, keep them; if it's Markdown, keep it as Markdown)
- Apply the user's instruction faithfully (e.g., more concise, formal tone, add metrics, etc.)
- Output ONLY the rewritten content, no explanation, no preamble, no markdown code fences

ORIGINAL CONTENT:
${input.content}`;

  const content = await generateWithRetry(prompt);
  return { content };
}

export type { GenerateResult, JobContext, RewriteInput };

type CompanyResearchInput = {
  company: string;
  jobTitle: string;
  jobDescription?: string;
  userContext?: string; // anything the user typed into the prompt box
};

export async function generateCompanyResearch(
  input: CompanyResearchInput
): Promise<GenerateResult> {
  const prompt = `You are a professional career coach helping a job candidate research a company before an interview or application.

COMPANY: ${input.company}
ROLE THEY'RE APPLYING FOR: ${input.jobTitle}
${input.jobDescription ? `JOB DESCRIPTION:\n${input.jobDescription}\n` : ""}
${input.userContext ? `ADDITIONAL CONTEXT FROM CANDIDATE:\n${input.userContext}\n` : ""}

Generate structured company research notes to help this candidate prepare. Cover the following:

1. **Company Overview** — what the company does, industry, size/stage if known
2. **Products & Services** — key offerings relevant to this role
3. **Culture & Values** — known workplace culture, mission, values
4. **Recent News & Developments** — notable recent events (funding, launches, layoffs, expansions)
5. **Role Fit** — how this candidate's role fits into the company's goals and structure
6. **Suggested Questions to Ask** — 3-5 thoughtful questions the candidate could ask interviewers

FORMAT RULES:
- Use markdown with "## " section headings for each of the 6 sections above
- Keep each section concise — 2-5 bullet points or a short paragraph
- Use "- " bullet points where appropriate
- If you don't have reliable information about something, say "Research recommended:" and suggest what to look up rather than guessing
- Output ONLY the research notes, no preamble, no explanation`;

  const content = await generateWithRetry(prompt);
  return { content };
}

export type { CompanyResearchInput };
