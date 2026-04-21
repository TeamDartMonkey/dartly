import { beforeEach, describe, expect, it, vi } from "vitest";

const mockJobCreate = vi.fn();
const mockJobFindFirst = vi.fn();
const mockJobUpdate = vi.fn();
const mockJobDeleteMany = vi.fn();
const mockStageHistoryCreate = vi.fn();
const mockActivityCreate = vi.fn();
const mockTx = {
  job: { create: mockJobCreate, update: mockJobUpdate, findFirst: vi.fn() },
  jobStageHistory: { create: mockStageHistoryCreate },
  jobActivity: { create: mockActivityCreate },
};

vi.mock("server-only", () => ({}));

vi.mock("@/services/prisma", () => ({
  prisma: {
    $transaction: vi.fn((fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)),
    job: {
      findFirst: mockJobFindFirst,
      findMany: vi.fn(),
      deleteMany: mockJobDeleteMany,
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createJob", () => {
  it("creates job with initial stage history", async () => {
    const { createJob } = await import("@/services/jobs");

    const mockCreated = { id: "job-1", stage: "INTERESTED", createdAt: new Date() };
    mockJobCreate.mockResolvedValue(mockCreated);
    mockStageHistoryCreate.mockResolvedValue({});

    await createJob({
      userId: "user-1",
      title: "Engineer",
      company: "Acme",
    });

    expect(mockJobCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user-1",
          title: "Engineer",
          company: "Acme",
          stage: "INTERESTED",
        }),
      })
    );
    expect(mockStageHistoryCreate).toHaveBeenCalledWith({
      data: { jobId: "job-1", fromStage: null, toStage: "INTERESTED" },
    });
  });

  it("creates job with explicit stage", async () => {
    const { createJob } = await import("@/services/jobs");

    const mockCreated = { id: "job-2", stage: "APPLIED", createdAt: new Date() };
    mockJobCreate.mockResolvedValue(mockCreated);
    mockStageHistoryCreate.mockResolvedValue({});

    await createJob({
      userId: "user-1",
      title: "Dev",
      company: "Corp",
      stage: "Applied",
    });

    expect(mockJobCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ stage: "APPLIED" }),
      })
    );
    expect(mockStageHistoryCreate).toHaveBeenCalledWith({
      data: { jobId: "job-2", fromStage: null, toStage: "APPLIED" },
    });
  });
});

describe("updateJob", () => {
  // NEGATIVE CASE: When only non-stage fields are edited (e.g. title),
  // the transaction should NOT create stage history or activity records.
  // This prevents spam in the Timeline tab from trivial edits.
  it("updates job without creating stage history when stage unchanged", async () => {
    const { updateJob } = await import("@/services/jobs");

    mockJobFindFirst.mockResolvedValue({ id: "j1", userId: "u1", stage: "APPLIED" });
    mockJobUpdate.mockResolvedValue({ id: "j1", stage: "APPLIED" });
    mockStageHistoryCreate.mockResolvedValue({});

    await updateJob("j1", "u1", { title: "Updated Title" });

    expect(mockStageHistoryCreate).not.toHaveBeenCalled();
    expect(mockActivityCreate).not.toHaveBeenCalled();
  });

  // HAPPY PATH: When the stage changes (Applied → Interview), the transaction must:
  // 1. Create a JobStageHistory record with the correct from/to stages
  // 2. Create a JobActivity record of type "STAGE" with a human-readable title
  // Both assertions verify the exact arguments passed to Prisma, proving the
  // stage labels are mapped correctly and the job ID is wired through.
  it("creates stage history and STAGE activity when stage changes", async () => {
    const { updateJob } = await import("@/services/jobs");

    mockJobFindFirst.mockResolvedValue({ id: "j1", userId: "u1", stage: "APPLIED" });
    mockJobUpdate.mockResolvedValue({ id: "j1", stage: "INTERVIEW" });
    mockStageHistoryCreate.mockResolvedValue({});
    mockActivityCreate.mockResolvedValue({});

    await updateJob("j1", "u1", { stage: "Interview" });

    expect(mockStageHistoryCreate).toHaveBeenCalledWith({
      data: { jobId: "j1", fromStage: "APPLIED", toStage: "INTERVIEW" },
    });
    expect(mockActivityCreate).toHaveBeenCalledWith({
      data: {
        jobId: "j1",
        type: "STAGE",
        title: "Stage changed: Applied → Interview",
      },
    });
  });

  // EDGE CASE: Updating a nonexistent job returns null instead of throwing.
  // The API layer uses this to return a 404 response.
  it("returns null when job not found", async () => {
    const { updateJob } = await import("@/services/jobs");

    mockJobFindFirst.mockResolvedValue(null);

    const result = await updateJob("missing", "u1", { title: "X" });
    expect(result).toBeNull();
  });
});

describe("cross-user access guards", () => {
  const OTHER_USER = "u2";

  it("getJob scopes lookup by userId (wrong user → null)", async () => {
    const { getJob } = await import("@/services/jobs");
    mockJobFindFirst.mockResolvedValue(null);

    const result = await getJob("j1", OTHER_USER);

    expect(result).toBeNull();
    expect(mockJobFindFirst).toHaveBeenCalledWith({
      where: { id: "j1", userId: OTHER_USER },
    });
  });

  it("updateJob scopes lookup by userId and skips update on wrong user", async () => {
    const { updateJob } = await import("@/services/jobs");
    mockJobFindFirst.mockResolvedValue(null);

    const result = await updateJob("j1", OTHER_USER, { title: "tampered" });

    expect(result).toBeNull();
    expect(mockJobUpdate).not.toHaveBeenCalled();
    expect(mockJobFindFirst).toHaveBeenCalledWith({
      where: { id: "j1", userId: OTHER_USER },
    });
  });

  it("deleteJob scopes deleteMany by userId (wrong user → false, zero rows)", async () => {
    const { deleteJob } = await import("@/services/jobs");
    mockJobDeleteMany.mockResolvedValue({ count: 0 });

    const result = await deleteJob("j1", OTHER_USER);

    expect(result).toBe(false);
    expect(mockJobDeleteMany).toHaveBeenCalledWith({
      where: { id: "j1", userId: OTHER_USER },
    });
  });

  it("deleteJob returns true when the row matches the caller", async () => {
    const { deleteJob } = await import("@/services/jobs");
    mockJobDeleteMany.mockResolvedValue({ count: 1 });

    const result = await deleteJob("j1", "u1");
    expect(result).toBe(true);
  });
});
