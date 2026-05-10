import type { Job as PrismaJob } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/services/prisma", () => ({
  prisma: {},
}));

describe("toJobResponse", () => {
  it("maps createdAt from Prisma Job", async () => {
    const { toJobResponse } = await import("@/services/jobs");
    const prismaJob = {
      id: "1",
      userId: "user-1",
      title: "Engineer",
      company: "Acme",
      stage: "APPLIED",
      location: "Remote",
      description: null,
      compensationNotes: null,
      applicationDate: null,
      deadline: null,
      recruiterNotes: null,
      customNotes: null,
      priority: false,
      lastActivityAt: new Date("2026-01-10"),
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-10"),
      companyResearch: null,
      prepNotesStar: null,
      prepNotesQuestions: null,
      prepNotesTalkingPoints: null,
    } satisfies PrismaJob;

    const result = toJobResponse(prismaJob);
    expect(result.createdAt).toBe("2026-01-01");
  });

  it("maps the three structured prep notes fields", async () => {
    const { toJobResponse } = await import("@/services/jobs");
    const prismaJob = {
      id: "1",
      userId: "user-1",
      title: "Engineer",
      company: "Acme",
      stage: "APPLIED",
      location: null,
      description: null,
      compensationNotes: null,
      applicationDate: null,
      deadline: null,
      recruiterNotes: null,
      customNotes: null,
      priority: false,
      lastActivityAt: new Date("2026-01-10"),
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-10"),
      companyResearch: null,
      prepNotesStar: "star content",
      prepNotesQuestions: "questions content",
      prepNotesTalkingPoints: "talking points content",
    } satisfies PrismaJob;

    const result = toJobResponse(prismaJob);
    expect(result.prepNotesStar).toBe("star content");
    expect(result.prepNotesQuestions).toBe("questions content");
    expect(result.prepNotesTalkingPoints).toBe("talking points content");
  });

  it("maps null prep notes fields to undefined", async () => {
    const { toJobResponse } = await import("@/services/jobs");
    const prismaJob = {
      id: "1",
      userId: "user-1",
      title: "Engineer",
      company: "Acme",
      stage: "APPLIED",
      location: null,
      description: null,
      compensationNotes: null,
      applicationDate: null,
      deadline: null,
      recruiterNotes: null,
      customNotes: null,
      priority: false,
      lastActivityAt: new Date("2026-01-10"),
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-10"),
      companyResearch: null,
      prepNotesStar: null,
      prepNotesQuestions: null,
      prepNotesTalkingPoints: null,
    } satisfies PrismaJob;

    const result = toJobResponse(prismaJob);
    expect(result.prepNotesStar).toBeUndefined();
    expect(result.prepNotesQuestions).toBeUndefined();
    expect(result.prepNotesTalkingPoints).toBeUndefined();
  });
});
