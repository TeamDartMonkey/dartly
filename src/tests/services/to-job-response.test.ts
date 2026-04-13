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
      outcomeAt: null,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-10"),
    } as any;

    const result = toJobResponse(prismaJob);
    expect(result.createdAt).toBe("2026-01-01");
  });
});
