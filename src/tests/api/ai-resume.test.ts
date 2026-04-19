import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockRequireAuth,
  mockValidateBody,
  mockGetProfile,
  mockGenerateResumeDraft,
  mockCreateDocument,
  mockToDocumentResponse,
  mockJobFindFirst,
} = vi.hoisted(() => ({
  mockRequireAuth: vi.fn(),
  mockValidateBody: vi.fn(),
  mockGetProfile: vi.fn(),
  mockGenerateResumeDraft: vi.fn(),
  mockCreateDocument: vi.fn(),
  mockToDocumentResponse: vi.fn(),
  mockJobFindFirst: vi.fn(),
}));

vi.mock("@/lib/api-wrapper", () => ({
  withHttpLogging: vi.fn((_req: unknown, handler: () => unknown) => handler()),
}));

vi.mock("@/lib/requireAuth", () => ({
  requireAuth: mockRequireAuth,
}));

vi.mock("@/lib/logger", () => ({
  default: { info: vi.fn(), error: vi.fn() },
}));

vi.mock("@/lib/validate-body", () => ({
  validateBody: mockValidateBody,
}));

vi.mock("@/services/ai", () => ({
  generateResumeDraft: mockGenerateResumeDraft,
}));

vi.mock("@/services/documents", () => ({
  createDocument: mockCreateDocument,
  toDocumentResponse: mockToDocumentResponse,
}));

vi.mock("@/services/profile", () => ({
  getProfile: mockGetProfile,
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(async () => null),
}));

vi.mock("@/services/prisma", () => ({
  prisma: {
    job: { findFirst: mockJobFindFirst },
  },
}));

import { POST } from "@/app/api/ai/resume/route";

const mockUser = { id: "user-123" };
const mockProfile = {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  experiences: [],
  educations: [],
  skills: [],
  targetRoles: [],
  targetLocations: [],
};
const mockJob = {
  id: "job-1",
  userId: "user-123",
  title: "Engineer",
  company: "Acme",
  description: "Build things",
  stage: "APPLIED",
};
const mockDoc = { id: "doc-1", type: "RESUME", name: "Resume - Acme" };
const mockVersion = { id: "ver-1", versionNumber: 1, content: "Generated resume" };
const mockDocResponse = { id: "doc-1", type: "RESUME", name: "Resume - Acme", versionNumber: 1 };

function makeRequest(): NextRequest {
  return new Request("http://localhost/api/ai/resume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobId: "job-1" }),
  }) as unknown as NextRequest;
}

describe("POST /api/ai/resume", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue(mockUser);
    mockValidateBody.mockResolvedValue({ jobId: "job-1" });
    mockGetProfile.mockResolvedValue(mockProfile);
    mockJobFindFirst.mockResolvedValue(mockJob);
    mockGenerateResumeDraft.mockResolvedValue({ content: "Generated resume" });
    mockCreateDocument.mockResolvedValue({ doc: mockDoc, version: mockVersion });
    mockToDocumentResponse.mockReturnValue(mockDocResponse);
  });

  it("returns 201 with generated document", async () => {
    const res = await POST(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body).toEqual(mockDocResponse);
    expect(mockCreateDocument).toHaveBeenCalledWith("user-123", {
      type: "RESUME",
      name: "Resume - Acme",
      content: "Generated resume",
      jobId: "job-1",
    });
  });

  it("returns 400 when user has no profile", async () => {
    mockGetProfile.mockResolvedValue(null);

    const res = await POST(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Profile is required to generate a resume");
  });

  it("returns 404 when job not found", async () => {
    mockJobFindFirst.mockResolvedValue(null);

    const res = await POST(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("Job not found");
  });

  it("returns 401 when not authenticated", async () => {
    const { ApiError } = await import("@/lib/api-error");
    mockRequireAuth.mockRejectedValue(new ApiError(401, "Unauthorized"));

    const res = await POST(makeRequest());
    expect(res.status).toBe(401);
  });

  it("returns 400 when request body validation fails", async () => {
    const { ApiError } = await import("@/lib/api-error");
    mockValidateBody.mockRejectedValue(new ApiError(400, "Invalid request body"));

    const res = await POST(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Invalid request body");
  });

  it("returns 429 when rate-limited", async () => {
    const { NextResponse } = await import("next/server");
    const rateLimitMod = await import("@/lib/rate-limit");
    vi.mocked(rateLimitMod.checkRateLimit).mockResolvedValueOnce(
      NextResponse.json({ error: "Too many requests" }, { status: 429 })
    );

    const res = await POST(makeRequest());
    expect(res.status).toBe(429);
  });
});
