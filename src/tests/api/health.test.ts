import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/api-wrapper", () => ({
  withHttpLogging: vi.fn((_req, handler) => handler()),
}));

vi.mock("@/lib/logger", () => ({
  logError: vi.fn(),
}));

vi.mock("@/services/prisma", () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}));

import { GET } from "@/app/api/health/route";

function createMockRequest(): NextRequest {
  return new Request("http://localhost:3000/api/health", {
    method: "GET",
  }) as unknown as NextRequest;
}

describe("GET /api/health", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { prisma } = await import("@/services/prisma");
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ "?column?": 1 }]);
  });

  it("returns 200 with status ok and database up when DB is reachable", async () => {
    const response = await GET(createMockRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.database).toBe("up");
    expect(body.timestamp).toBeDefined();
  });

  it("queries the database to verify connectivity", async () => {
    const { prisma } = await import("@/services/prisma");
    await GET(createMockRequest());
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it("returns 503 with database down when DB is unreachable", async () => {
    const { prisma } = await import("@/services/prisma");
    vi.mocked(prisma.$queryRaw).mockRejectedValueOnce(new Error("connection refused"));

    const response = await GET(createMockRequest());
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.status).toBe("error");
    expect(body.database).toBe("down");
    expect(body.timestamp).toBeDefined();
  });

  it("logs the error when DB connectivity fails", async () => {
    const { prisma } = await import("@/services/prisma");
    const { logError } = await import("@/lib/logger");
    const dbError = new Error("connection refused");
    vi.mocked(prisma.$queryRaw).mockRejectedValueOnce(dbError);

    await GET(createMockRequest());

    expect(logError).toHaveBeenCalledWith(
      expect.stringContaining("Health check failed"),
      dbError
    );
  });

  it("returns a valid ISO timestamp", async () => {
    const response = await GET(createMockRequest());
    const body = await response.json();

    const parsed = new Date(body.timestamp);
    expect(parsed.toISOString()).toBe(body.timestamp);
  });

  it("returns 429 when rate limited", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const { NextResponse } = await import("next/server");

    vi.mocked(checkRateLimit).mockResolvedValueOnce(
      NextResponse.json({ error: "Too many requests" }, { status: 429 })
    );

    const response = await GET(createMockRequest());
    expect(response.status).toBe(429);
  });
});
