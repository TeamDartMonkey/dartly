import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockRequireAuth,
  mockValidateBody,
  mockGetProfile,
  mockGenerateCoverLetterDraft,
  mockCreateForJob,
  mockToDocumentResponse,
  mockJobFindFirst,
} = vi.hoisted(() => ({
  mockRequireAuth: vi.fn(),
  mockValidateBody: vi.fn(),
  mockGetProfile: vi.fn(),
  mockGenerateCoverLetterDraft: vi.fn(),
  mockCreateForJob: vi.fn(),
  mockToDocumentResponse: vi.fn(),
  mockJobFindFirst: vi.fn(),
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

vi.mock("@/lib/validate-body", () => ({
  validateBody: mockValidateBody,
}));

vi.mock("@/services/ai", () => ({
  generateCoverLetterDraft: mockGenerateCoverLetterDraft,
}));

vi.mock("@/services/documents", () => ({
  createDocumentForJob: mockCreateForJob,
  toDocumentResponse: mockToDocumentResponse,
}));

vi.mock("@/services/profile", () => ({
  getProfile: mockGetProfile,
}));

vi.mock("@/services/prisma", () => ({
  prisma: {
    job: { findFirst: mockJobFindFirst },
  },
}));

import { POST } from "@/app/api/ai/cover-letter/route";

const mockUser = { id: "user-123" };
const mockProfile = {
  firstName: "Jane",
  lastName: "Smith",
  email: "jane@example.com",
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
const mockDoc = { id: "doc-1", type: "COVER_LETTER", name: "Cover Letter - Acme" };
const mockVersion = { id: "ver-1", versionNumber: 1, content: "Generated cover letter" };
const mockDocResponse = {
  id: "doc-1",
  type: "COVER_LETTER",
  name: "Cover Letter - Acme",
  versionNumber: 1,
};

function makeRequest(): NextRequest {
  return new Request("http://localhost/api/ai/cover-letter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobId: "job-1" }),
  }) as unknown as NextRequest;
}

describe("POST /api/ai/cover-letter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue(mockUser);
    mockValidateBody.mockResolvedValue({ jobId: "job-1" });
    mockGetProfile.mockResolvedValue(mockProfile);
    mockJobFindFirst.mockResolvedValue(mockJob);
    mockGenerateCoverLetterDraft.mockResolvedValue({ content: "Generated cover letter" });
    mockCreateForJob.mockResolvedValue({ doc: mockDoc, version: mockVersion, isNew: true });
    mockToDocumentResponse.mockReturnValue(mockDocResponse);
  });

  it("returns 201 with generated cover letter document", async () => {
    const res = await POST(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body).toEqual(mockDocResponse);
    expect(mockCreateForJob).toHaveBeenCalledWith("user-123", {
      type: "COVER_LETTER",
      name: "Cover Letter - Acme",
      content: "Generated cover letter",
      jobId: "job-1",
    });
  });

  it("returns 400 when user has no profile", async () => {
    mockGetProfile.mockResolvedValue(null);

    const res = await POST(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Profile is required to generate a cover letter");
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
