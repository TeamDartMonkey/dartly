import type { ProfileData } from "@/types/profile";

type JobContext = {
  title: string;
  company: string;
  description?: string;
};

type GenerateResult = {
  content: string;
};

/**
 * Generates a resume draft using profile data and job context.
 *
 * Placeholder implementation — returns a structured Markdown resume.
 * Swap in a real AI provider (OpenAI, Anthropic, etc.) when decided.
 */
export async function generateResumeDraft(
  profile: ProfileData,
  job: JobContext
): Promise<GenerateResult> {
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Your Name";
  const contact = [profile.email, profile.phone, profile.location].filter(Boolean).join(" | ");

  const lines: string[] = [];
  lines.push(`# ${name}`);
  if (contact) lines.push(contact);
  lines.push("");

  if (profile.summary) {
    lines.push("## Summary");
    lines.push(profile.summary);
    lines.push("");
  }

  lines.push(`> Tailored for **${job.title}** at **${job.company}**`);
  lines.push("");

  if (profile.experiences.length > 0) {
    lines.push("## Experience");
    for (const exp of profile.experiences) {
      const dates = [exp.startDate, exp.isCurrent ? "Present" : exp.endDate]
        .filter(Boolean)
        .join(" - ");
      lines.push(`### ${exp.title}${exp.organization ? ` — ${exp.organization}` : ""}`);
      if (dates) lines.push(dates);
      if (exp.description) lines.push(exp.description);
      lines.push("");
    }
  }

  if (profile.educations.length > 0) {
    lines.push("## Education");
    for (const edu of profile.educations) {
      const degree = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(", ");
      lines.push(`### ${edu.institution}`);
      if (degree) lines.push(degree);
      const dates = [edu.startDate, edu.endDate].filter(Boolean).join(" - ");
      if (dates) lines.push(dates);
      if (edu.gpa) lines.push(`GPA: ${edu.gpa}`);
      lines.push("");
    }
  }

  if (profile.skills.length > 0) {
    lines.push("## Skills");
    lines.push(profile.skills.map((s) => s.name).join(", "));
    lines.push("");
  }

  return { content: lines.join("\n") };
}

/**
 * Generates a cover letter draft using profile data and job context.
 *
 * Placeholder implementation — returns a structured cover letter template.
 */
export async function generateCoverLetterDraft(
  profile: ProfileData,
  job: JobContext
): Promise<GenerateResult> {
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Your Name";

  const lines: string[] = [];
  lines.push(name);
  if (profile.email) lines.push(profile.email);
  if (profile.phone) lines.push(profile.phone);
  if (profile.location) lines.push(profile.location);
  lines.push("");
  lines.push(`Dear Hiring Manager at ${job.company},`);
  lines.push("");
  lines.push(
    `I am writing to express my interest in the **${job.title}** position at **${job.company}**.${
      profile.summary ? ` ${profile.summary}` : ""
    }`
  );
  lines.push("");

  if (profile.experiences.length > 0) {
    const recent = profile.experiences[0];
    lines.push(
      `In my role as ${recent.title}${recent.organization ? ` at ${recent.organization}` : ""}, I developed skills and experience directly relevant to this position.${
        recent.description ? ` ${recent.description}` : ""
      }`
    );
    lines.push("");
  }

  if (job.description) {
    lines.push(
      "Based on the job description, I believe my background aligns well with your team's needs. I am eager to bring my skills to this role and contribute to your organization's goals."
    );
    lines.push("");
  }

  lines.push(
    "I would welcome the opportunity to discuss how my experience can contribute to your team. Thank you for considering my application."
  );
  lines.push("");
  lines.push("Sincerely,");
  lines.push(name);

  return { content: lines.join("\n") };
}

type RewriteInput = {
  content: string;
  instruction: string;
};

/**
 * Rewrites/improves document content based on an instruction.
 *
 * Placeholder implementation — prepends the instruction as a note
 * and returns lightly restructured content. Replace with AI call.
 */
export async function rewriteContent(input: RewriteInput): Promise<GenerateResult> {
  const { content, instruction } = input;

  // Placeholder: apply simple transformations based on common instructions
  let rewritten = content;

  const lower = instruction.toLowerCase();
  if (lower.includes("concise") || lower.includes("shorter") || lower.includes("brief")) {
    // Trim lines that are empty or very short filler
    rewritten = content
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .join("\n");
  } else if (lower.includes("formal") || lower.includes("professional")) {
    rewritten = content.replace(/!\s*/g, ". ").replace(/\.\.\./g, ".");
  }

  // Always prepend instruction note so user knows what was requested
  rewritten = `<!-- Rewrite instruction: ${instruction} -->\n${rewritten}`;

  return { content: rewritten };
}
