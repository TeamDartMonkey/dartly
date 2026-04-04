import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockUpdateJob, mockDeleteJob, mockToJobResponse, mockRequireAuth } = vi.hoisted(() => ({
  mockUpdateJob: vi.fn(),
  mockDeleteJob: vi.fn(),
  mockToJobResponse: vi.fn(),
  mockRequireAuth: vi.fn(),
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

vi.mock("@/services/jobs", () => ({
  updateJob: mockUpdateJob,
  deleteJob: mockDeleteJob,
  toJobResponse: mockToJobResponse,
}));

import { DELETE, PUT } from "@/app/api/jobs/[id]/route";

const mockUser = { id: "user-123" };
const mockJob = { id: "job-456", title: "Engineer", company: "Acme" };
const mockJobResponse = {
  id: "job-456",
  title: "Engineer",
  company: "Acme",
  stage: "Interested",
  lastActivityDate: "2024-01-01",
};

function makeRequest(body?: object): NextRequest {
  return new Request("http://localhost/api/jobs/job-456", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  }) as unknown as NextRequest;
}

const context = { params: Promise.resolve({ id: "job-456" }) };

describe("PUT /api/jobs/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue(mockUser);
    mockToJobResponse.mockReturnValue(mockJobResponse);
  });

  it("returns 200 with updated job", async () => {
    mockUpdateJob.mockResolvedValue(mockJob);

    const res = await PUT(makeRequest({ title: "Engineer", company: "Acme" }), context);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(mockJobResponse);
  });

  it("returns 404 when job not found", async () => {
    mockUpdateJob.mockResolvedValue(null);

    const res = await PUT(makeRequest({ title: "Engineer" }), context);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("Job not found");
  });

  it("returns 401 when not authenticated", async () => {
    const { ApiError } = await import("@/lib/api-error");
    mockRequireAuth.mockRejectedValue(new ApiError(401, "Unauthorized"));

    const res = await PUT(makeRequest({ title: "Engineer" }), context);
    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/jobs/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue(mockUser);
  });

  it("returns 204 when job is deleted", async () => {
    mockDeleteJob.mockResolvedValue(true);

    const req = new Request("http://localhost/api/jobs/job-456", {
      method: "DELETE",
    }) as unknown as NextRequest;
    const res = await DELETE(req, context);

    expect(res.status).toBe(204);
  });

  it("returns 404 when job not found", async () => {
    mockDeleteJob.mockResolvedValue(false);

    const req = new Request("http://localhost/api/jobs/job-456", {
      method: "DELETE",
    }) as unknown as NextRequest;
    const res = await DELETE(req, context);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("Job not found");
  });

  it("returns 401 when not authenticated", async () => {
    const { ApiError } = await import("@/lib/api-error");
    mockRequireAuth.mockRejectedValue(new ApiError(401, "Unauthorized"));

    const req = new Request("http://localhost/api/jobs/job-456", {
      method: "DELETE",
    }) as unknown as NextRequest;
    const res = await DELETE(req, context);
    expect(res.status).toBe(401);
  });
});
