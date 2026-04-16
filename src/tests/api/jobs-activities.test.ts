import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockVerifyJobOwnership, mockGetActivities, mockCreateActivity, mockRequireAuth } =
  vi.hoisted(() => ({
    mockVerifyJobOwnership: vi.fn(),
    mockGetActivities: vi.fn(),
    mockCreateActivity: vi.fn(),
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

vi.mock("@/services/activities", () => ({
  verifyJobOwnership: mockVerifyJobOwnership,
  getActivities: mockGetActivities,
  createActivity: mockCreateActivity,
}));

import { GET, POST } from "@/app/api/jobs/[id]/activities/route";

const mockUser = { id: "user-123" };
const context = { params: Promise.resolve({ id: "job-1" }) };

function makeRequest(body?: object): NextRequest {
  return new Request("http://localhost/api/jobs/job-1/activities", {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  }) as unknown as NextRequest;
}

describe("GET /api/jobs/[id]/activities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue(mockUser);
  });

  it("returns 200 with activities", async () => {
    mockVerifyJobOwnership.mockResolvedValue(true);
    const activities = [{ id: "a1", type: "NOTE", title: "Applied", jobId: "job-1" }];
    mockGetActivities.mockResolvedValue(activities);

    const res = await GET(makeRequest(), context);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(activities);
  });

  it("returns 404 when job not found or not owned", async () => {
    mockVerifyJobOwnership.mockResolvedValue(false);

    const res = await GET(makeRequest(), context);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("Job not found");
  });

  it("returns 401 when not authenticated", async () => {
    const { ApiError } = await import("@/lib/api-error");
    mockRequireAuth.mockRejectedValue(new ApiError(401, "Unauthorized"));

    const res = await GET(makeRequest(), context);
    expect(res.status).toBe(401);
  });
});

describe("POST /api/jobs/[id]/activities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue(mockUser);
  });

  it("returns 201 with created activity", async () => {
    mockVerifyJobOwnership.mockResolvedValue(true);
    const created = { id: "a1", type: "INTERVIEW", title: "Phone Screen", jobId: "job-1" };
    mockCreateActivity.mockResolvedValue(created);

    const res = await POST(makeRequest({ type: "INTERVIEW", title: "Phone Screen" }), context);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body).toEqual(created);
  });

  it("returns 404 when job not found or not owned", async () => {
    mockVerifyJobOwnership.mockResolvedValue(false);

    const res = await POST(makeRequest({ type: "NOTE", title: "Test" }), context);

    expect(res.status).toBe(404);
    expect(mockCreateActivity).not.toHaveBeenCalled();
  });

  it("returns 400 when type is invalid", async () => {
    mockVerifyJobOwnership.mockResolvedValue(true);

    const res = await POST(makeRequest({ type: "INVALID", title: "Test" }), context);

    expect(res.status).toBe(400);
  });

  it("returns 400 when title is missing", async () => {
    mockVerifyJobOwnership.mockResolvedValue(true);

    const res = await POST(makeRequest({ type: "NOTE" }), context);

    expect(res.status).toBe(400);
  });

  it("returns 401 when not authenticated", async () => {
    const { ApiError } = await import("@/lib/api-error");
    mockRequireAuth.mockRejectedValue(new ApiError(401, "Unauthorized"));

    const res = await POST(makeRequest({ type: "NOTE", title: "Test" }), context);
    expect(res.status).toBe(401);
  });
});
