import { beforeEach, describe, expect, it, vi } from "vitest";

const mockTransaction = vi.fn();
const mockProfileUpsert = vi.fn();
const mockProfileFindUnique = vi.fn();
const mockExperienceFindMany = vi.fn();
const mockExperienceDeleteMany = vi.fn();
const mockExperienceCreate = vi.fn();
const mockExperienceUpdate = vi.fn();
const mockEducationFindMany = vi.fn();
const mockEducationDeleteMany = vi.fn();
const mockEducationCreate = vi.fn();
const mockEducationUpdate = vi.fn();
const mockSkillFindMany = vi.fn();
const mockSkillDeleteMany = vi.fn();
const mockSkillCreate = vi.fn();
const mockSkillUpdate = vi.fn();

const tx = {
  profile: {
    upsert: mockProfileUpsert,
    findUnique: mockProfileFindUnique,
  },
  experience: {
    findMany: mockExperienceFindMany,
    deleteMany: mockExperienceDeleteMany,
    create: mockExperienceCreate,
    update: mockExperienceUpdate,
  },
  education: {
    findMany: mockEducationFindMany,
    deleteMany: mockEducationDeleteMany,
    create: mockEducationCreate,
    update: mockEducationUpdate,
  },
  skill: {
    findMany: mockSkillFindMany,
    deleteMany: mockSkillDeleteMany,
    create: mockSkillCreate,
    update: mockSkillUpdate,
  },
};

vi.mock("@/services/prisma", () => ({
  prisma: {
    $transaction: mockTransaction,
  },
}));

const { upsertProfile } = await import("@/services/profile");

const PROFILE_ID = "profile-1";
const USER_ID = "user-1";

const baseProfile = {
  id: PROFILE_ID,
  userId: USER_ID,
  firstName: null,
  lastName: null,
  email: null,
  phone: null,
  location: null,
  professionalLinks: null,
  headline: null,
  summary: null,
  targetRoles: [],
  targetLocations: [],
  workModePreference: null,
  salaryPreference: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function setupTransaction() {
  mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => fn(tx));
}

beforeEach(() => {
  vi.clearAllMocks();
  setupTransaction();

  mockProfileUpsert.mockResolvedValue(baseProfile);
  mockProfileFindUnique.mockResolvedValue({
    ...baseProfile,
    experiences: [],
    educations: [],
    skills: [],
  });

  mockExperienceFindMany.mockResolvedValue([]);
  mockEducationFindMany.mockResolvedValue([]);
  mockSkillFindMany.mockResolvedValue([]);
});

describe("upsertProfile", () => {
  it("wraps the operation in a transaction", async () => {
    await upsertProfile(USER_ID, { firstName: "Test" });
    expect(mockTransaction).toHaveBeenCalledTimes(1);
  });

  it("calls profile.upsert with correct userId and fields", async () => {
    await upsertProfile(USER_ID, { firstName: "Jane" });
    expect(mockProfileUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: USER_ID },
        create: expect.objectContaining({ userId: USER_ID, firstName: "Jane" }),
        update: { firstName: "Jane" },
      })
    );
  });

  describe("experience syncing", () => {
    it("creates 3 new experiences when none exist", async () => {
      const experiences = [
        {
          type: "EMPLOYMENT" as const,
          title: "A",
          organization: "X",
          startDate: "2024-01-01",
          isCurrent: true,
          description: "",
        },
        {
          type: "EMPLOYMENT" as const,
          title: "B",
          organization: "Y",
          startDate: "2024-02-01",
          isCurrent: false,
          description: "",
        },
        {
          type: "PROJECT" as const,
          title: "C",
          organization: "Z",
          startDate: "2024-03-01",
          isCurrent: false,
          description: "",
        },
      ];

      await upsertProfile(USER_ID, { experiences });

      expect(mockExperienceCreate).toHaveBeenCalledTimes(3);
      expect(mockExperienceUpdate).not.toHaveBeenCalled();
      expect(mockExperienceDeleteMany).not.toHaveBeenCalled();
    });

    // PROFILE SYNC TEST: The upsertProfile function must handle all three
    // operations in one call — update existing experiences (exp-1 gets new data),
    // create new ones (no id = new record), and delete removed ones (exp-2 was
    // in the DB but not in the submitted array, so it gets pruned).
    // This prevents stale data from accumulating when the user edits their profile.
    it("updates existing, creates new, and deletes removed experiences", async () => {
      mockExperienceFindMany.mockResolvedValue([{ id: "exp-1" }, { id: "exp-2" }]);

      const experiences = [
        {
          id: "exp-1",
          type: "EMPLOYMENT" as const,
          title: "Updated",
          organization: "X",
          startDate: "2024-01-01",
          isCurrent: true,
          description: "",
        },
        {
          type: "PROJECT" as const,
          title: "New",
          organization: "Y",
          startDate: "2024-06-01",
          isCurrent: false,
          description: "",
        },
      ];

      await upsertProfile(USER_ID, { experiences });

      expect(mockExperienceUpdate).toHaveBeenCalledTimes(1);
      expect(mockExperienceUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: "exp-1" } })
      );
      expect(mockExperienceCreate).toHaveBeenCalledTimes(1);
      expect(mockExperienceDeleteMany).toHaveBeenCalledWith({
        where: { id: { in: ["exp-2"] } },
      });
    });
  });

  describe("education syncing", () => {
    it("creates new educations", async () => {
      const educations = [
        {
          institution: "MIT",
          degree: "BS",
          fieldOfStudy: "CS",
          startDate: "2020-01-01",
          endDate: "2024-01-01",
          gpa: "4.0",
        },
      ];

      await upsertProfile(USER_ID, { educations });

      expect(mockEducationCreate).toHaveBeenCalledTimes(1);
      expect(mockEducationUpdate).not.toHaveBeenCalled();
    });

    it("updates existing and deletes removed educations", async () => {
      mockEducationFindMany.mockResolvedValue([{ id: "edu-1" }, { id: "edu-2" }]);

      const educations = [
        {
          id: "edu-1",
          institution: "MIT Updated",
          degree: "MS",
          fieldOfStudy: "CS",
          startDate: "2020-01-01",
          endDate: "2024-01-01",
          gpa: "4.0",
        },
      ];

      await upsertProfile(USER_ID, { educations });

      expect(mockEducationUpdate).toHaveBeenCalledTimes(1);
      expect(mockEducationCreate).not.toHaveBeenCalled();
      expect(mockEducationDeleteMany).toHaveBeenCalledWith({
        where: { id: { in: ["edu-2"] } },
      });
    });
  });

  describe("skill syncing", () => {
    it("creates new skills when none exist", async () => {
      const skills = [{ name: "TypeScript" }, { name: "React" }];

      await upsertProfile(USER_ID, { skills });

      expect(mockSkillCreate).toHaveBeenCalledTimes(2);
      expect(mockSkillUpdate).not.toHaveBeenCalled();
    });

    it("updates existing skill name and deletes removed skills", async () => {
      mockSkillFindMany.mockResolvedValue([{ id: "skill-1" }, { id: "skill-2" }]);

      const skills = [{ id: "skill-1", name: "TypeScript Updated" }];

      await upsertProfile(USER_ID, { skills });

      expect(mockSkillUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "skill-1" },
          data: { profileId: PROFILE_ID, name: "TypeScript Updated" },
        })
      );
      expect(mockSkillCreate).not.toHaveBeenCalled();
      expect(mockSkillDeleteMany).toHaveBeenCalledWith({
        where: { id: { in: ["skill-2"] } },
      });
    });
  });

  it("does not sync child collections when not provided", async () => {
    await upsertProfile(USER_ID, { firstName: "Jane" });

    expect(mockExperienceFindMany).not.toHaveBeenCalled();
    expect(mockEducationFindMany).not.toHaveBeenCalled();
    expect(mockSkillFindMany).not.toHaveBeenCalled();
  });
});
