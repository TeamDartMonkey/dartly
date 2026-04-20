import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockRequireAuth, mockGenerateCoverLetterDraft } = vi.hoisted(() => ({
  mockRequireAuth: vi.fn(),
  mockGenerateCoverLetterDraft: vi.fn(),
}));

vi.mock("@/lib/api-wrapper", () => ({
  withHttpLogging: vi.fn((_req: unknown, handler: () => unknown) => handler()),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/requireAuth", () => ({
  requireAuth: mockRequireAuth,
}));

vi.mock("@/lib/logger", () => ({
  default: { info: vi.fn(), error: vi.fn() },
  logError: vi.fn(),
}));

vi.mock("@/services/ai", () => ({
  generateCoverLetterDraft: mockGenerateCoverLetterDraft,
}));

import { POST } from "@/app/api/ai/cover-letter/route";

function makeRequest(): NextRequest {
  return new Request("http://localhost/api/ai/cover-letter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobId: "job-1" }),
  }) as unknown as NextRequest;
}

describe("POST /api/ai/cover-letter rate limiting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 429 when rate limited without invoking auth or AI", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const { NextResponse } = await import("next/server");
    vi.mocked(checkRateLimit).mockResolvedValueOnce(
      NextResponse.json({ error: "Too many requests" }, { status: 429 })
    );

    const res = await POST(makeRequest());

    expect(res.status).toBe(429);
    expect(mockRequireAuth).not.toHaveBeenCalled();
    expect(mockGenerateCoverLetterDraft).not.toHaveBeenCalled();
  });
});
