import { beforeEach, describe, expect, it, vi } from "vitest";

const mockJobFindMany = vi.fn();
const mockStageHistoryFindMany = vi.fn();

vi.mock("@/services/prisma", () => ({
  prisma: {
    job: { findMany: mockJobFindMany },
    jobStageHistory: { findMany: mockStageHistoryFindMany },
  },
}));

const { getDashboardMetrics } = await import("@/services/metrics");

const USER_ID = "user-1";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getDashboardMetrics", () => {
  it("returns zero metrics when user has no jobs", async () => {
    mockJobFindMany.mockResolvedValue([]);

    const metrics = await getDashboardMetrics(USER_ID);

    expect(metrics.totalJobs).toBe(0);
    expect(metrics.activeApplications).toBe(0);
    expect(metrics.responseRate).toBe(0);
    expect(metrics.interviewRate).toBe(0);
    expect(metrics.rejectionRate).toBe(0);
    expect(metrics.ghostRate).toBe(0);
    expect(metrics.offerCount).toBe(0);
    expect(metrics.stageCounts).toEqual({});
  });

  it("computes stage counts correctly", async () => {
    mockJobFindMany.mockResolvedValue([
      { id: "j1", stage: "INTERESTED" },
      { id: "j2", stage: "INTERESTED" },
      { id: "j3", stage: "APPLIED" },
      { id: "j4", stage: "INTERVIEW" },
      { id: "j5", stage: "REJECTED" },
    ]);
    mockStageHistoryFindMany.mockResolvedValue([]);

    const metrics = await getDashboardMetrics(USER_ID);

    expect(metrics.stageCounts).toEqual({
      Interested: 2,
      Applied: 1,
      Interview: 1,
      Rejected: 1,
    });
    expect(metrics.totalJobs).toBe(5);
  });

  it("computes active applications excluding Rejected, Archived, and Ghosted", async () => {
    mockJobFindMany.mockResolvedValue([
      { id: "j1", stage: "INTERESTED" },
      { id: "j2", stage: "APPLIED" },
      { id: "j3", stage: "REJECTED" },
      { id: "j4", stage: "ARCHIVED" },
      { id: "j5", stage: "INTERVIEW" },
      { id: "j6", stage: "GHOSTED" },
    ]);
    mockStageHistoryFindMany.mockResolvedValue([]);

    const metrics = await getDashboardMetrics(USER_ID);

    expect(metrics.activeApplications).toBe(3);
  });

  it("computes response rate from stage history", async () => {
    mockJobFindMany.mockResolvedValue([
      { id: "j1", stage: "APPLIED" },
      { id: "j2", stage: "INTERVIEW" },
    ]);

    mockStageHistoryFindMany.mockResolvedValueOnce([
      {
        jobId: "j2",
        fromStage: "APPLIED",
        toStage: "INTERVIEW",
        changedAt: new Date("2026-01-10"),
      },
    ]);

    const metrics = await getDashboardMetrics(USER_ID);

    expect(metrics.responseRate).toBe(50);
  });

  it("computes interview rate", async () => {
    mockJobFindMany.mockResolvedValue([
      { id: "j1", stage: "APPLIED" },
      { id: "j2", stage: "INTERVIEW" },
      { id: "j3", stage: "OFFER" },
      { id: "j4", stage: "REJECTED" },
    ]);
    mockStageHistoryFindMany.mockResolvedValue([]);

    const metrics = await getDashboardMetrics(USER_ID);

    expect(metrics.interviewRate).toBe(50);
  });

  it("computes rejection rate", async () => {
    mockJobFindMany.mockResolvedValue([
      { id: "j1", stage: "APPLIED" },
      { id: "j2", stage: "APPLIED" },
      { id: "j3", stage: "REJECTED" },
    ]);
    mockStageHistoryFindMany.mockResolvedValue([]);

    const metrics = await getDashboardMetrics(USER_ID);

    expect(metrics.rejectionRate).toBe(33);
  });

  it("computes ghost rate", async () => {
    mockJobFindMany.mockResolvedValue([
      { id: "j1", stage: "APPLIED" },
      { id: "j2", stage: "APPLIED" },
      { id: "j3", stage: "GHOSTED" },
      { id: "j4", stage: "INTERVIEW" },
    ]);
    mockStageHistoryFindMany.mockResolvedValue([]);

    const metrics = await getDashboardMetrics(USER_ID);

    expect(metrics.ghostRate).toBe(25);
  });

  it("computes offer count", async () => {
    mockJobFindMany.mockResolvedValue([
      { id: "j1", stage: "APPLIED" },
      { id: "j2", stage: "OFFER" },
      { id: "j3", stage: "OFFER" },
    ]);
    mockStageHistoryFindMany.mockResolvedValue([]);

    const metrics = await getDashboardMetrics(USER_ID);

    expect(metrics.offerCount).toBe(2);
  });

  it("returns zero rates for interested-only jobs", async () => {
    mockJobFindMany.mockResolvedValue([{ id: "j1", stage: "INTERESTED" }]);

    const metrics = await getDashboardMetrics(USER_ID);

    expect(metrics.responseRate).toBe(0);
    expect(metrics.interviewRate).toBe(0);
    expect(metrics.rejectionRate).toBe(0);
    expect(metrics.ghostRate).toBe(0);
  });
});
