import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockRequireAuth, mockGetDashboardMetrics } = vi.hoisted(() => ({
  mockRequireAuth: vi.fn(),
  mockGetDashboardMetrics: vi.fn(),
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

vi.mock("@/services/metrics", () => ({
  getDashboardMetrics: mockGetDashboardMetrics,
}));

import { GET } from "@/app/api/metrics/route";

const mockUser = { id: "user-123" };
const mockMetrics = {
  stageCounts: { Interested: 3, Applied: 2, Interview: 1 },
  totalJobs: 6,
  activeApplications: 4,
  responseRate: 50,
  interviewRate: 33,
  rejectionRate: 17,
};

function makeRequest(): NextRequest {
  return new Request("http://localhost/api/metrics", {
    method: "GET",
  }) as unknown as NextRequest;
}

describe("GET /api/metrics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue(mockUser);
  });

  it("returns 200 with metrics", async () => {
    mockGetDashboardMetrics.mockResolvedValue(mockMetrics);

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(mockMetrics);
    expect(mockGetDashboardMetrics).toHaveBeenCalledWith("user-123");
  });

  it("returns 401 when not authenticated", async () => {
    const { ApiError } = await import("@/lib/api-error");
    mockRequireAuth.mockRejectedValue(new ApiError(401, "Unauthorized"));

    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it("returns empty metrics for user with no jobs", async () => {
    mockGetDashboardMetrics.mockResolvedValue({
      stageCounts: {},
      totalJobs: 0,
      activeApplications: 0,
      responseRate: 0,
      interviewRate: 0,
      rejectionRate: 0,
    });

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.totalJobs).toBe(0);
    expect(body.interviewRate).toBe(0);
    expect(body.rejectionRate).toBe(0);
  });
});
