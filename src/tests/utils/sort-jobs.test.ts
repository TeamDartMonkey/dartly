import { describe, expect, it } from "vitest";
import type { Job } from "@/types/job";
import { sortJobs } from "@/utils/sort-jobs";

const jobs: Job[] = [
  {
    id: "1",
    title: "Engineer",
    company: "Beta Corp",
    stage: "Applied",
    lastActivityDate: "2026-04-10",
    createdAt: "2026-03-01",
    deadline: "2026-04-20",
    priority: false,
  },
  {
    id: "2",
    title: "Designer",
    company: "Alpha Inc",
    stage: "Interview",
    lastActivityDate: "2026-04-12",
    createdAt: "2026-03-15",
    deadline: "2026-04-15",
    priority: true,
  },
  {
    id: "3",
    title: "Manager",
    company: "Gamma LLC",
    stage: "Offer",
    lastActivityDate: "2026-04-08",
    createdAt: "2026-02-20",
    priority: false,
  },
];

describe("sortJobs", () => {
  it("sorts by recent (lastActivityDate descending)", () => {
    const result = sortJobs(jobs, "recent");
    expect(result.map((j) => j.id)).toEqual(["2", "1", "3"]);
  });

  it("sorts by company A-Z", () => {
    const result = sortJobs(jobs, "company");
    expect(result.map((j) => j.id)).toEqual(["2", "1", "3"]);
  });

  it("sorts by priority first", () => {
    const result = sortJobs(jobs, "priority");
    expect(result[0].id).toBe("2");
  });

  it("sorts by deadline soonest first", () => {
    const result = sortJobs(jobs, "deadline");
    expect(result.map((j) => j.id)).toEqual(["2", "1", "3"]);
  });

  it("pushes jobs without deadline to the bottom in deadline sort", () => {
    const result = sortJobs(jobs, "deadline");
    expect(result[result.length - 1].id).toBe("3");
  });

  it("uses createdAt as tiebreaker for equal deadlines", () => {
    const tied: Job[] = [
      {
        id: "a",
        title: "A",
        company: "A",
        stage: "Applied",
        lastActivityDate: "2026-01-01",
        createdAt: "2026-01-01",
        deadline: "2026-05-01",
      },
      {
        id: "b",
        title: "B",
        company: "B",
        stage: "Applied",
        lastActivityDate: "2026-01-01",
        createdAt: "2026-02-01",
        deadline: "2026-05-01",
      },
    ];
    const result = sortJobs(tied, "deadline");
    expect(result[0].id).toBe("b");
  });

  it("sorts by created date newest first", () => {
    const result = sortJobs(jobs, "created");
    expect(result.map((j) => j.id)).toEqual(["2", "1", "3"]);
  });

  it("does not mutate the original array", () => {
    const copy = [...jobs];
    sortJobs(jobs, "created");
    expect(jobs).toEqual(copy);
  });
});
