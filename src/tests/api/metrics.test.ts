import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockRequireAuth, mockGetDashboardMetrics, mockGetAnalyticsBreakdown } = vi.hoisted(() => ({
  mockRequireAuth: vi.fn(),
  mockGetDashboardMetrics: vi.fn(),
  mockGetAnalyticsBreakdown: vi.fn(),
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
  getAnalyticsBreakdown: mockGetAnalyticsBreakdown,
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
  ghostRate: 25,
  offerCount: 1,
};

function makeRequest(): NextRequest {
  return new Request("http://localhost/api/metrics", {
    method: "GET",
  }) as unknown as NextRequest;
}

const mockAnalytics = {
  velocity: {
    last30Days: 4,
    prior30Days: 2,
    changePercent: 100,
    dailyCounts: new Array(30).fill(0),
    dayStartIsos: new Array(30).fill(""),
  },
  funnel: {
    reachedInterested: 6,
    reachedApplied: 4,
    reachedInterview: 2,
    reachedOffer: 1,
    appliedRate: 67,
    interviewRate: 50,
    offerRate: 50,
  },
  timeInStage: { APPLIED: 8 },
};

describe("GET /api/metrics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue(mockUser);
    mockGetAnalyticsBreakdown.mockResolvedValue(mockAnalytics);
  });

  it("returns 200 with metrics merged with analytics", async () => {
    mockGetDashboardMetrics.mockResolvedValue(mockMetrics);

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ ...mockMetrics, analytics: mockAnalytics });
    expect(mockGetDashboardMetrics).toHaveBeenCalledWith("user-123");
    expect(mockGetAnalyticsBreakdown).toHaveBeenCalledWith("user-123");
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
      ghostRate: 0,
      offerCount: 0,
    });

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.totalJobs).toBe(0);
    expect(body.ghostRate).toBe(0);
    expect(body.offerCount).toBe(0);
    expect(body.analytics).toBeDefined();
  });
});
