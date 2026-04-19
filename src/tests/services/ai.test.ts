import { describe, expect, it, vi } from "vitest";
import type { ProfileData } from "@/types/profile";

vi.mock("@/lib/logger", () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  logError: vi.fn(),
}));

const { generateCoverLetterDraft, generateResumeDraft, rewriteContent } = await import(
  "@/services/ai"
);

const baseProfile: ProfileData = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  phone: "555-1234",
  location: "New York, NY",
  summary: "Experienced software engineer",
  targetRoles: ["Frontend Engineer"],
  targetLocations: ["Remote"],
  experiences: [
    {
      type: "EMPLOYMENT",
      title: "Senior Developer",
      organization: "TechCorp",
      startDate: "2023-01",
      isCurrent: true,
      description: "Led frontend development",
    },
  ],
  educations: [
    {
      institution: "MIT",
      degree: "BS",
      fieldOfStudy: "Computer Science",
      startDate: "2019",
      endDate: "2023",
      gpa: "3.8",
    },
  ],
  skills: [{ name: "TypeScript" }, { name: "React" }, { name: "Node.js" }],
};

const jobContext = {
  title: "Frontend Engineer",
  company: "StartupCo",
  description: "Build amazing UIs",
};

describe("generateResumeDraft", () => {
  it("generates a resume with profile data", async () => {
    const result = await generateResumeDraft(baseProfile, jobContext);

    expect(result.content).toContain("Jane Doe");
    expect(result.content).toContain("Frontend Engineer");
    expect(result.content).toContain("StartupCo");
    expect(result.content).toContain("Senior Developer");
    expect(result.content).toContain("MIT");
    expect(result.content).toContain("TypeScript");
  });

  it("handles empty profile gracefully", async () => {
    const emptyProfile: ProfileData = {
      targetRoles: [],
      targetLocations: [],
      experiences: [],
      educations: [],
      skills: [],
    };

    const result = await generateResumeDraft(emptyProfile, jobContext);

    expect(result.content).toContain("Your Name");
    expect(result.content).toContain("StartupCo");
  });
});

describe("generateCoverLetterDraft", () => {
  it("generates a cover letter with profile and job data", async () => {
    const result = await generateCoverLetterDraft(baseProfile, jobContext);

    expect(result.content).toContain("Jane Doe");
    expect(result.content).toContain("Frontend Engineer");
    expect(result.content).toContain("StartupCo");
    expect(result.content).toContain("Dear Hiring Manager");
  });

  it("handles profile without experience", async () => {
    const profile: ProfileData = {
      ...baseProfile,
      experiences: [],
    };

    const result = await generateCoverLetterDraft(profile, jobContext);
    expect(result.content).toContain("StartupCo");
  });
});

describe("rewriteContent", () => {
  it("returns rewritten content with instruction comment", async () => {
    const result = await rewriteContent({
      content: "My original resume content",
      instruction: "Make it more formal",
    });

    expect(result.content).toContain("Make it more formal");
    expect(result.content).toContain("My original resume content");
  });

  it("applies concise transformation", async () => {
    const result = await rewriteContent({
      content: "Line one\n\n\nLine two\n\n",
      instruction: "Make more concise",
    });

    expect(result.content).not.toContain("\n\n\n");
  });

  it("applies formal transformation — removes exclamation marks", async () => {
    const result = await rewriteContent({
      content: "Hello! I'm very excited! Really!!!",
      instruction: "Make it more professional",
    });

    // Strip the leading instruction comment (which contains `<!--`) before asserting
    const transformed = result.content.replace(/^<!--.*-->\n/, "");
    expect(transformed).not.toContain("!");
  });

  it("passes through unchanged when no known keyword matches", async () => {
    const result = await rewriteContent({
      content: "Keep this exactly",
      instruction: "swag it up",
    });

    // only the leading instruction comment should have been added
    expect(result.content.replace(/^<!--.*-->\n/, "")).toBe("Keep this exactly");
  });
});
