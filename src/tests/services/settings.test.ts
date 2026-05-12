import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFindUnique = vi.fn();
const mockUpsert = vi.fn();
const mockTransaction = vi.fn();

const tx = {
  userSettings: {
    findUnique: mockFindUnique,
    upsert: mockUpsert,
  },
};

vi.mock("@/services/prisma", () => ({
  prisma: {
    $transaction: mockTransaction,
    userSettings: {
      findUnique: mockFindUnique,
      upsert: mockUpsert,
    },
  },
}));

const { getSettings, upsertSettings } = await import("@/services/settings");
const { DEFAULT_PREFERENCES } = await import("@/types/settings");

describe("settings service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTransaction.mockImplementation(async (cb: (t: typeof tx) => Promise<unknown>) => cb(tx));
  });

  describe("getSettings", () => {
    it("returns defaults when no settings row exists", async () => {
      mockFindUnique.mockResolvedValue(null);
      const result = await getSettings("user-1");
      expect(result).toEqual(DEFAULT_PREFERENCES);
    });

    it("merges stored preferences with defaults", async () => {
      mockFindUnique.mockResolvedValue({
        preferences: { dashboardView: "list" },
      });
      const result = await getSettings("user-1");
      expect(result.dashboardView).toBe("list");
      expect(result.defaultJobStage).toBe(DEFAULT_PREFERENCES.defaultJobStage);
    });
  });

  describe("upsertSettings", () => {
    it("creates settings row with partial update merged into defaults", async () => {
      mockFindUnique.mockResolvedValue(null);
      mockUpsert.mockResolvedValue({
        preferences: { ...DEFAULT_PREFERENCES, dashboardView: "list" },
      });

      await upsertSettings("user-1", { dashboardView: "list" });

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "user-1" },
          create: expect.objectContaining({
            userId: "user-1",
            preferences: { ...DEFAULT_PREFERENCES, dashboardView: "list" },
          }),
          update: expect.objectContaining({
            preferences: { ...DEFAULT_PREFERENCES, dashboardView: "list" },
          }),
        })
      );
    });

    it("merges partial update with existing preferences", async () => {
      mockFindUnique.mockResolvedValue({
        preferences: { ...DEFAULT_PREFERENCES, defaultJobStage: "APPLIED" },
      });
      mockUpsert.mockResolvedValue({
        preferences: {
          ...DEFAULT_PREFERENCES,
          defaultJobStage: "APPLIED",
          dashboardView: "list",
        },
      });

      await upsertSettings("user-1", { dashboardView: "list" });

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            preferences: expect.objectContaining({
              defaultJobStage: "APPLIED",
              dashboardView: "list",
            }),
          }),
        })
      );
    });
  });
});
