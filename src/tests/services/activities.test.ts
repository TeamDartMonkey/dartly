import { beforeEach, describe, expect, it, vi } from "vitest";

const mockJobFindFirst = vi.fn();
const mockActivityFindFirst = vi.fn();
const mockFindMany = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

vi.mock("server-only", () => ({}));

vi.mock("@/services/prisma", () => ({
  prisma: {
    job: { findFirst: mockJobFindFirst },
    jobActivity: {
      findMany: mockFindMany,
      findFirst: mockActivityFindFirst,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
    },
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

  it("returns activities ordered newest first", async () => {
    const { getActivities } = await import("@/services/activities");
    const mockActivities = [
      { id: "a2", type: "NOTE", title: "Second", createdAt: new Date("2026-02-01") },
      { id: "a1", type: "INTERVIEW", title: "First", createdAt: new Date("2026-01-01") },
    ];
    mockFindMany.mockResolvedValue(mockActivities);

    const result = await getActivities("j1");
    expect(result).toEqual(mockActivities);
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { jobId: "j1" },
      orderBy: { createdAt: "desc" },
    });
  });
});

describe("createActivity", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates activity with all fields", async () => {
    const { createActivity } = await import("@/services/activities");
    const mockActivity = { id: "a1", jobId: "j1", type: "INTERVIEW", title: "Phone Screen" };
    mockCreate.mockResolvedValue(mockActivity);

    const result = await createActivity("j1", {
      type: "INTERVIEW",
      title: "Phone Screen",
      description: "Technical round",
      scheduledAt: "2026-04-01T10:00:00Z",
      roundType: "PHONE_SCREEN",
      completed: false,
    });

    expect(result).toEqual(mockActivity);
    expect(mockCreate).toHaveBeenCalledWith({
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

  it("creates activity with minimal fields", async () => {
    const { createActivity } = await import("@/services/activities");
    mockCreate.mockResolvedValue({ id: "a2" });

    await createActivity("j1", { type: "NOTE", title: "Note" });

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        jobId: "j1",
        type: "NOTE",
        title: "Note",
        description: null,
        scheduledAt: null,
        roundType: null,
        completed: false,
      }),
    });
  });
});

describe("updateActivity", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates activity fields", async () => {
    const { updateActivity } = await import("@/services/activities");
    const existing = {
      id: "a1",
      jobId: "j1",
      title: "Old",
      description: "desc",
      scheduledAt: null,
      roundType: null,
      completed: false,
    };
    mockActivityFindFirst.mockResolvedValue(existing);
    mockUpdate.mockResolvedValue({ ...existing, title: "New" });

    const _result = await updateActivity("a1", "j1", { title: "New" });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "a1" },
      data: expect.objectContaining({ title: "New" }),
    });
  });

  it("returns null when activity not found or wrong job", async () => {
    const { updateActivity } = await import("@/services/activities");
    mockActivityFindFirst.mockResolvedValue(null);

    const result = await updateActivity("a1", "j1", { title: "X" });
    expect(result).toBeNull();
  });
});

describe("deleteActivity", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes activity that belongs to job", async () => {
    const { deleteActivity } = await import("@/services/activities");
    mockActivityFindFirst.mockResolvedValue({ id: "a1", jobId: "j1" });
    mockDelete.mockResolvedValue({ id: "a1" });

    const _result = await deleteActivity("a1", "j1");
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: "a1" } });
  });

  it("returns null when activity not found or wrong job", async () => {
    const { deleteActivity } = await import("@/services/activities");
    mockActivityFindFirst.mockResolvedValue(null);

    const result = await deleteActivity("a1", "j1");
    expect(result).toBeNull();
  });
});
