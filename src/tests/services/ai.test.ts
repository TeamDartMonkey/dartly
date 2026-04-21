import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGenerateContent } = vi.hoisted(() => ({
  mockGenerateContent: vi.fn(),
}));

vi.mock("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
      getGenerativeModel: vi.fn().mockReturnValue({
        generateContent: mockGenerateContent,
      }),
    })),
  };
});

vi.mock("@/lib/env", () => ({
  env: { GEMINI_API_KEY: "test-key" },
}));

import { generateCoverLetterDraft, generateResumeDraft, rewriteContent } from "@/services/ai";
import type { ProfileData } from "@/types/profile";

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

beforeEach(() => {
  mockGenerateContent.mockReset();
});

describe("generateResumeDraft", () => {
  it("calls Gemini and returns resume content", async () => {
    mockGenerateContent.mockResolvedValue({
      response: { text: () => "# Jane Doe\n\n### Experience\n\nGenerated resume content" },
    });

    const result = await generateResumeDraft(baseProfile, jobContext);

    expect(result.content).toContain("Jane Doe");
    expect(result.content).toContain("Experience");
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });

  it("includes profile data in the prompt", async () => {
    mockGenerateContent.mockResolvedValue({
      response: { text: () => "# Jane Doe" },
    });

    await generateResumeDraft(baseProfile, jobContext);

    const call = mockGenerateContent.mock.calls[0][0];
    expect(call).toContain("Jane Doe");
    expect(call).toContain("Frontend Engineer");
    expect(call).toContain("StartupCo");
    expect(call).toContain("TypeScript");
  });

  it("throws on empty response", async () => {
    mockGenerateContent.mockResolvedValue({
      response: { text: () => "" },
    });

    await expect(generateResumeDraft(baseProfile, jobContext)).rejects.toThrow(
      "AI generation returned empty response"
    );
  });

  it("retries on 503 and eventually succeeds", async () => {
    vi.useFakeTimers();
    mockGenerateContent
      .mockRejectedValueOnce(new Error("503 Service Unavailable"))
      .mockResolvedValueOnce({
        response: { text: () => "# Jane Doe\n\n### Experience\n\nContent" },
      });

    const promise = generateResumeDraft(baseProfile, jobContext);
    await vi.advanceTimersByTimeAsync(3000);
    const result = await promise;

    expect(result.content).toContain("Jane Doe");
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it("throws on non-retryable API error", async () => {
    mockGenerateContent.mockRejectedValue(new Error("Internal server error"));

    await expect(generateResumeDraft(baseProfile, jobContext)).rejects.toThrow(
      "AI generation failed"
    );
  });
});

describe("generateCoverLetterDraft", () => {
  it("calls Gemini and returns cover letter content", async () => {
    mockGenerateContent.mockResolvedValue({
      response: { text: () => "Jane Doe\n\nDear Hiring Manager,\n\nCover letter body" },
    });

    const result = await generateCoverLetterDraft(baseProfile, jobContext);

    expect(result.content).toContain("Jane Doe");
    expect(result.content).toContain("Hiring Manager");
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });

  it("includes job context in the prompt", async () => {
    mockGenerateContent.mockResolvedValue({
      response: { text: () => "Cover letter" },
    });

    await generateCoverLetterDraft(baseProfile, jobContext);

    const call = mockGenerateContent.mock.calls[0][0];
    expect(call).toContain("StartupCo");
    expect(call).toContain("Frontend Engineer");
  });

  it("includes real date and headerInfo format in the prompt", async () => {
    mockGenerateContent.mockResolvedValue({
      response: { text: () => "Cover letter" },
    });

    await generateCoverLetterDraft(baseProfile, jobContext);

    const call = mockGenerateContent.mock.calls[0][0];
    expect(call).toContain("headerInfo");
    expect(call).not.toContain("[Current Date]");
    expect(call).toMatch(/\b(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}, \d{4}\b/);
  });

  it("throws on empty response", async () => {
    mockGenerateContent.mockResolvedValue({
      response: { text: () => "   " },
    });

    await expect(generateCoverLetterDraft(baseProfile, jobContext)).rejects.toThrow(
      "AI generation returned empty response"
    );
  });
});

describe("rewriteContent", () => {
  it("calls Gemini with content and instruction", async () => {
    mockGenerateContent.mockResolvedValue({
      response: { text: () => "Rewritten content that is more concise" },
    });

    const result = await rewriteContent({
      content: "Original content here",
      instruction: "Make more concise",
    });

    expect(result.content).toContain("Rewritten content");
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });

  it("includes original content and instruction in prompt", async () => {
    mockGenerateContent.mockResolvedValue({
      response: { text: () => "Rewritten" },
    });

    await rewriteContent({
      content: "My original text",
      instruction: "Make formal",
    });

    const call = mockGenerateContent.mock.calls[0][0];
    expect(call).toContain("My original text");
    expect(call).toContain("Make formal");
  });

  it("throws on empty response", async () => {
    mockGenerateContent.mockResolvedValue({
      response: { text: () => "" },
    });

    await expect(rewriteContent({ content: "test", instruction: "rewrite" })).rejects.toThrow(
      "AI generation returned empty response"
    );
  });

  it("throws on API error with descriptive message", async () => {
    mockGenerateContent.mockRejectedValue(new Error("Internal server error"));

    await expect(rewriteContent({ content: "test", instruction: "rewrite" })).rejects.toThrow(
      "AI generation failed"
    );
  });
});
