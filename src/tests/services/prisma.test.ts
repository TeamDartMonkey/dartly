import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrismaInstance = {
  $connect: vi.fn(),
  $disconnect: vi.fn(),
};

vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn(() => mockPrismaInstance),
}));

describe("prisma singleton", () => {
  beforeEach(() => {
    vi.resetModules();
    (globalThis as Record<string, unknown>).prisma = undefined;
  });

  it("exports a defined prisma instance", async () => {
    const { prisma } = await import("@/services/prisma");
    expect(prisma).toBeDefined();
  });

  it("reuses the same instance on repeated imports", async () => {
    const { prisma: a } = await import("@/services/prisma");
    const { prisma: b } = await import("@/services/prisma");
    expect(a).toBe(b);
  });

  it("stores the instance on globalThis in non-production", async () => {
    vi.stubEnv("NODE_ENV", "development");

    const { prisma } = await import("@/services/prisma");
    expect((globalThis as Record<string, unknown>).prisma).toBe(prisma);

    vi.unstubAllEnvs();
  });
});
