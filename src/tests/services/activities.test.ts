import { beforeEach, describe, expect, it, vi } from "vitest";

const mockJobFindFirst = vi.fn();
const mockActivityFindFirst = vi.fn();
const mockFindMany = vi.fn();
const mockCreate = vi.fn();
const mockUpdateMany = vi.fn();
const mockDeleteMany = vi.fn();
const mockTransaction = vi.fn();

vi.mock("server-only", () => ({}));

vi.mock("@/services/prisma", () => ({
  prisma: {
    job: { findFirst: mockJobFindFirst },
    jobActivity: {
      findMany: mockFindMany,
      findFirst: mockActivityFindFirst,
      create: mockCreate,
      updateMany: mockUpdateMany,
      deleteMany: mockDeleteMany,
    },
    $transaction: mockTransaction,
  },
}));

describe("verifyJobOwnership", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns true when job belongs to user", async () => {
    const { verifyJobOwnership } = await import("@/services/activities");
    mockJobFindFirst.mockResolvedValue({ id: "j1" });

    const result = await verifyJobOwnership("j1", "u1");
    expect(result).toBe(true);
    expect(mockJobFindFirst).toHaveBeenCalledWith({
      where: { id: "j1", userId: "u1" },
      select: { id: true },
    });
  });

  it("returns false when job does not belong to user", async () => {
    const { verifyJobOwnership } = await import("@/services/activities");
    mockJobFindFirst.mockResolvedValue(null);

    const result = await verifyJobOwnership("j1", "u1");
    expect(result).toBe(false);
  });
});

describe("getActivities", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns activities ordered newest first, scoped by user", async () => {
    const { getActivities } = await import("@/services/activities");
    const mockActivities = [
      { id: "a2", type: "NOTE", title: "Second", createdAt: new Date("2026-02-01") },
      { id: "a1", type: "INTERVIEW", title: "First", createdAt: new Date("2026-01-01") },
    ];
    mockFindMany.mockResolvedValue(mockActivities);

    const result = await getActivities("j1", "u1");
    expect(result).toEqual(mockActivities);
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { jobId: "j1", job: { userId: "u1" } },
      orderBy: { createdAt: "desc" },
    });
  });
});

describe("createActivity", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates activity with all fields when user owns job", async () => {
    const { createActivity } = await import("@/services/activities");
    const mockActivity = { id: "a1", jobId: "j1", type: "INTERVIEW", title: "Phone Screen" };

    const tx = {
      job: { findFirst: vi.fn().mockResolvedValue({ id: "j1" }) },
      jobActivity: { create: vi.fn().mockResolvedValue(mockActivity) },
    };
    mockTransaction.mockImplementation(async (cb: (t: typeof tx) => Promise<unknown>) => cb(tx));

    const result = await createActivity("j1", "u1", {
      type: "INTERVIEW",
      title: "Phone Screen",
      description: "Technical round",
      scheduledAt: "2026-04-01T10:00:00Z",
      roundType: "PHONE_SCREEN",
      completed: false,
    });

    expect(result).toEqual(mockActivity);
    expect(tx.jobActivity.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        jobId: "j1",
        type: "INTERVIEW",
        title: "Phone Screen",
        description: "Technical round",
        roundType: "PHONE_SCREEN",
        completed: false,
      }),
    });
  });

  it("returns null when user does not own job", async () => {
    const { createActivity } = await import("@/services/activities");
    const tx = {
      job: { findFirst: vi.fn().mockResolvedValue(null) },
      jobActivity: { create: vi.fn() },
    };
    mockTransaction.mockImplementation(async (cb: (t: typeof tx) => Promise<unknown>) => cb(tx));

    const result = await createActivity("j1", "u1", { type: "NOTE", title: "Note" });
    expect(result).toBeNull();
    expect(tx.jobActivity.create).not.toHaveBeenCalled();
  });
});

describe("updateActivity", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates activity fields scoped by user", async () => {
    const { updateActivity } = await import("@/services/activities");
    mockUpdateMany.mockResolvedValue({ count: 1 });
    mockActivityFindFirst.mockResolvedValue({ id: "a1", title: "New" });

    const result = await updateActivity("a1", "j1", "u1", { title: "New" });
    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { id: "a1", jobId: "j1", job: { userId: "u1" } },
      data: expect.objectContaining({ title: "New" }),
    });
    expect(result).toEqual({ id: "a1", title: "New" });
  });

  it("returns null when activity not found or wrong job", async () => {
    const { updateActivity } = await import("@/services/activities");
    mockUpdateMany.mockResolvedValue({ count: 0 });

    const result = await updateActivity("a1", "j1", "u1", { title: "X" });
    expect(result).toBeNull();
  });
});

describe("deleteActivity", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes activity that belongs to job and user", async () => {
    const { deleteActivity } = await import("@/services/activities");
    mockDeleteMany.mockResolvedValue({ count: 1 });

    const result = await deleteActivity("a1", "j1", "u1");
    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: { id: "a1", jobId: "j1", job: { userId: "u1" } },
    });
    expect(result).toEqual({ id: "a1" });
  });

  it("returns null when activity not found or wrong job", async () => {
    const { deleteActivity } = await import("@/services/activities");
    mockDeleteMany.mockResolvedValue({ count: 0 });

    const result = await deleteActivity("a1", "j1", "u1");
    expect(result).toBeNull();
  });
});
