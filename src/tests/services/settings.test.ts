import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFindUnique = vi.fn();
const mockUpsert = vi.fn();

vi.mock("@/services/prisma", () => ({
  prisma: {
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
  });

  describe("getSettings", () => {
    it("returns defaults when no settings row exists", async () => {
      mockFindUnique.mockResolvedValue(null);
      const result = await getSettings("user-1");
      expect(result).toEqual(DEFAULT_PREFERENCES);
    });

    it("merges stored preferences with defaults", async () => {
      mockFindUnique.mockResolvedValue({
        preferences: { showArchived: true },
      });
      const result = await getSettings("user-1");
      expect(result.showArchived).toBe(true);
      expect(result.defaultJobStage).toBe(DEFAULT_PREFERENCES.defaultJobStage);
    });
  });

  describe("upsertSettings", () => {
    it("creates settings row with partial update merged into defaults", async () => {
      mockFindUnique.mockResolvedValue(null);
      mockUpsert.mockResolvedValue({
        preferences: { ...DEFAULT_PREFERENCES, showArchived: true },
      });

      await upsertSettings("user-1", { showArchived: true });

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "user-1" },
          create: expect.objectContaining({
            userId: "user-1",
            preferences: { ...DEFAULT_PREFERENCES, showArchived: true },
          }),
          update: expect.objectContaining({
            preferences: { ...DEFAULT_PREFERENCES, showArchived: true },
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
          showArchived: true,
        },
      });

      await upsertSettings("user-1", { showArchived: true });

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            preferences: expect.objectContaining({
              defaultJobStage: "APPLIED",
              showArchived: true,
            }),
          }),
        })
      );
    });
  });
});
