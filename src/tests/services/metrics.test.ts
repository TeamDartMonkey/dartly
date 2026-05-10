import { beforeEach, describe, expect, it, vi } from "vitest";

const mockJobFindMany = vi.fn();
const mockStageHistoryFindMany = vi.fn();

vi.mock("@/services/prisma", () => ({
  prisma: {
    job: { findMany: mockJobFindMany },
    jobStageHistory: { findMany: mockStageHistoryFindMany },
  },
}));

const { getDashboardMetrics, getAnalyticsBreakdown } = await import("@/services/metrics");

const USER_ID = "user-1";

beforeEach(() => {
  vi.clearAllMocks();
  mockStageHistoryFindMany.mockResolvedValue([]);
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

    const metrics = await getDashboardMetrics(USER_ID);

    expect(metrics.activeApplications).toBe(3);
  });

  it("computes response rate based on current stage", async () => {
    mockJobFindMany.mockResolvedValue([
      { id: "j1", stage: "APPLIED" },
      { id: "j2", stage: "INTERVIEW" },
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

    const metrics = await getDashboardMetrics(USER_ID);

    expect(metrics.interviewRate).toBe(50);
  });

  it("computes rejection rate", async () => {
    mockJobFindMany.mockResolvedValue([
      { id: "j1", stage: "APPLIED" },
      { id: "j2", stage: "APPLIED" },
      { id: "j3", stage: "REJECTED" },
    ]);

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

    const metrics = await getDashboardMetrics(USER_ID);

    expect(metrics.ghostRate).toBe(25);
  });

  it("computes offer count", async () => {
    mockJobFindMany.mockResolvedValue([
      { id: "j1", stage: "APPLIED" },
      { id: "j2", stage: "OFFER" },
      { id: "j3", stage: "OFFER" },
    ]);

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

describe("getAnalyticsBreakdown — velocity", () => {
  // Pin "now" so tests are deterministic regardless of run time.
  const NOW = new Date("2026-04-27T12:00:00.000Z");
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  it("returns zero velocity when user has no jobs", async () => {
    mockJobFindMany.mockResolvedValue([]);

    const a = await getAnalyticsBreakdown(USER_ID);

    expect(a.velocity.last30Days).toBe(0);
    expect(a.velocity.prior30Days).toBe(0);
    expect(a.velocity.changePercent).toBe(0);
    expect(a.velocity.dailyCounts).toEqual(new Array(30).fill(0));
    expect(a.velocity.dayStartIsos).toHaveLength(30);
  });

  it("counts applications inside the last 30 days only", async () => {
    mockJobFindMany.mockResolvedValue([
      { id: "j1", stage: "APPLIED", applicationDate: new Date("2026-04-26T00:00:00Z") }, // 1d ago
      { id: "j2", stage: "APPLIED", applicationDate: new Date("2026-04-15T00:00:00Z") }, // 12d ago
      { id: "j3", stage: "APPLIED", applicationDate: new Date("2026-03-20T00:00:00Z") }, // 38d ago — prior window
      { id: "j4", stage: "INTERESTED", applicationDate: null }, // never applied
    ]);

    const a = await getAnalyticsBreakdown(USER_ID);

    expect(a.velocity.last30Days).toBe(2);
    expect(a.velocity.prior30Days).toBe(1);
  });

  it("computes changePercent vs prior 30 days (rounded to int)", async () => {
    mockJobFindMany.mockResolvedValue([
      // 4 in last 30 days
      { id: "a", stage: "APPLIED", applicationDate: new Date("2026-04-26") },
      { id: "b", stage: "APPLIED", applicationDate: new Date("2026-04-22") },
      { id: "c", stage: "APPLIED", applicationDate: new Date("2026-04-18") },
      { id: "d", stage: "APPLIED", applicationDate: new Date("2026-04-12") },
      // 2 in prior 30 days (between 30 and 60 days ago)
      { id: "e", stage: "APPLIED", applicationDate: new Date("2026-03-20") },
      { id: "f", stage: "APPLIED", applicationDate: new Date("2026-03-10") },
    ]);

    const a = await getAnalyticsBreakdown(USER_ID);

    expect(a.velocity.last30Days).toBe(4);
    expect(a.velocity.prior30Days).toBe(2);
    expect(a.velocity.changePercent).toBe(100); // (4-2)/2 * 100
  });

  it("returns 0 changePercent when prior 30 days had zero applications (avoid div-by-zero)", async () => {
    mockJobFindMany.mockResolvedValue([
      { id: "j1", stage: "APPLIED", applicationDate: new Date("2026-04-26") },
    ]);

    const a = await getAnalyticsBreakdown(USER_ID);

    expect(a.velocity.prior30Days).toBe(0);
    expect(a.velocity.changePercent).toBe(0);
  });

  it("buckets applications into 30 daily bins (oldest at index 0, today at index 29)", async () => {
    mockJobFindMany.mockResolvedValue([
      // 1d ago
      { id: "a", stage: "APPLIED", applicationDate: new Date("2026-04-26") },
      // 1d ago (same day → same bucket)
      { id: "b", stage: "APPLIED", applicationDate: new Date("2026-04-26T18:00:00Z") },
      // 12d ago
      { id: "c", stage: "APPLIED", applicationDate: new Date("2026-04-15") },
      // outside the 30-day window — must be excluded
      { id: "e", stage: "APPLIED", applicationDate: new Date("2026-03-20") },
    ]);

    const a = await getAnalyticsBreakdown(USER_ID);

    expect(a.velocity.dailyCounts).toHaveLength(30);
    // Sum of bucket counts should equal jobs that fall inside the window.
    const total = a.velocity.dailyCounts.reduce((s, n) => s + n, 0);
    expect(total).toBe(3);
    // Two jobs on the same recent day should land in one bucket together.
    expect(Math.max(...a.velocity.dailyCounts)).toBeGreaterThanOrEqual(2);
  });
});

describe("getAnalyticsBreakdown — funnel", () => {
  it("returns zeros when there are no jobs", async () => {
    mockJobFindMany.mockResolvedValue([]);

    const a = await getAnalyticsBreakdown(USER_ID);

    expect(a.funnel.reachedInterested).toBe(0);
    expect(a.funnel.reachedApplied).toBe(0);
    expect(a.funnel.reachedInterview).toBe(0);
    expect(a.funnel.reachedOffer).toBe(0);
    expect(a.funnel.appliedRate).toBe(0);
    expect(a.funnel.interviewRate).toBe(0);
    expect(a.funnel.offerRate).toBe(0);
  });

  it("counts every job toward 'reachedInterested'", async () => {
    mockJobFindMany.mockResolvedValue([
      { id: "j1", stage: "INTERESTED" },
      { id: "j2", stage: "APPLIED" },
      { id: "j3", stage: "REJECTED" },
    ]);

    const a = await getAnalyticsBreakdown(USER_ID);

    expect(a.funnel.reachedInterested).toBe(3);
  });

  it("uses current stage when no history is recorded", async () => {
    mockJobFindMany.mockResolvedValue([
      { id: "j1", stage: "INTERESTED" },
      { id: "j2", stage: "APPLIED" },
      { id: "j3", stage: "INTERVIEW" },
      { id: "j4", stage: "OFFER" },
    ]);

    const a = await getAnalyticsBreakdown(USER_ID);

    expect(a.funnel.reachedApplied).toBe(3); // j2,j3,j4
    expect(a.funnel.reachedInterview).toBe(2); // j3,j4
    expect(a.funnel.reachedOffer).toBe(1); // j4
  });

  it("uses max history rank when current stage is terminal (REJECTED/GHOSTED)", async () => {
    mockJobFindMany.mockResolvedValue([
      { id: "j1", stage: "REJECTED" }, // history has APPLIED + INTERVIEW
      { id: "j2", stage: "GHOSTED" }, // history has APPLIED only
      { id: "j3", stage: "REJECTED" }, // no history → only INTERESTED
    ]);
    mockStageHistoryFindMany.mockResolvedValue([
      { jobId: "j1", toStage: "APPLIED", changedAt: new Date("2026-01-01") },
      { jobId: "j1", toStage: "INTERVIEW", changedAt: new Date("2026-01-10") },
      { jobId: "j1", toStage: "REJECTED", changedAt: new Date("2026-01-20") },
      { jobId: "j2", toStage: "APPLIED", changedAt: new Date("2026-01-05") },
      { jobId: "j2", toStage: "GHOSTED", changedAt: new Date("2026-02-05") },
    ]);

    const a = await getAnalyticsBreakdown(USER_ID);

    expect(a.funnel.reachedApplied).toBe(2); // j1, j2
    expect(a.funnel.reachedInterview).toBe(1); // j1
    expect(a.funnel.reachedOffer).toBe(0);
  });

  it("computes conversion rates as integer percentages", async () => {
    mockJobFindMany.mockResolvedValue([
      { id: "a", stage: "INTERESTED" },
      { id: "b", stage: "APPLIED" },
      { id: "c", stage: "INTERVIEW" },
      { id: "d", stage: "OFFER" },
    ]);

    const a = await getAnalyticsBreakdown(USER_ID);

    // reachedInterested=4, reachedApplied=3, reachedInterview=2, reachedOffer=1
    expect(a.funnel.appliedRate).toBe(75); // 3/4
    expect(a.funnel.interviewRate).toBe(67); // 2/3 rounded
    expect(a.funnel.offerRate).toBe(50); // 1/2
  });
});

describe("getAnalyticsBreakdown — time in stage", () => {
  it("returns empty record when there are no transitions", async () => {
    mockJobFindMany.mockResolvedValue([{ id: "j1", stage: "INTERESTED" }]);

    const a = await getAnalyticsBreakdown(USER_ID);

    expect(a.timeInStage).toEqual({});
  });

  it("computes average days for each transition (closed and current)", async () => {
    // The current stage's time (last transition → now) is included so the
    // metric reflects active jobs rather than only fully-closed transitions.
    // We freeze "now" by stubbing Date for this test.
    const FAKE_NOW = new Date("2026-03-01T00:00:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(FAKE_NOW);
    try {
      mockJobFindMany.mockResolvedValue([
        { id: "j1", stage: "INTERVIEW" },
        { id: "j2", stage: "OFFER" },
      ]);
      mockStageHistoryFindMany.mockResolvedValue([
        // j1: INTERESTED for 4 days, APPLIED for 15 days, then INTERVIEW until now (40d)
        { jobId: "j1", toStage: "INTERESTED", changedAt: new Date("2026-01-01") },
        { jobId: "j1", toStage: "APPLIED", changedAt: new Date("2026-01-05") },
        { jobId: "j1", toStage: "INTERVIEW", changedAt: new Date("2026-01-20") },
        // j2: APPLIED for 5 days, INTERVIEW for 10 days, then OFFER until now (13d)
        { jobId: "j2", toStage: "APPLIED", changedAt: new Date("2026-02-01") },
        { jobId: "j2", toStage: "INTERVIEW", changedAt: new Date("2026-02-06") },
        { jobId: "j2", toStage: "OFFER", changedAt: new Date("2026-02-16") },
      ]);

      const a = await getAnalyticsBreakdown(USER_ID);

      expect(a.timeInStage.INTERESTED).toBe(4); // only j1 closed: 4 days
      expect(a.timeInStage.APPLIED).toBe(10); // (15+5)/2 = 10 days
      // INTERVIEW: j1 still in INTERVIEW (Jan 20 → Mar 1 = 40d) plus j2 closed (10d) → avg 25
      expect(a.timeInStage.INTERVIEW).toBe(25);
      // OFFER: j2 still in OFFER (Feb 16 → Mar 1 = 13d)
      expect(a.timeInStage.OFFER).toBe(13);
    } finally {
      vi.useRealTimers();
    }
  });

  it("scopes the history query by the user's job ids", async () => {
    mockJobFindMany.mockResolvedValue([
      { id: "j1", stage: "INTERESTED" },
      { id: "j2", stage: "APPLIED" },
    ]);

    await getAnalyticsBreakdown(USER_ID);

    expect(mockStageHistoryFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { jobId: { in: ["j1", "j2"] } },
      })
    );
  });
});
