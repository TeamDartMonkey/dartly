import { describe, expect, it } from "vitest";
import type { Job } from "@/types/job";
import { searchJobs } from "@/utils/search-jobs";

const jobs: Job[] = [
  {
    id: "1",
    title: "Frontend Engineer",
    company: "Acme Corp",
    stage: "Applied",
    lastActivityDate: "2024-01-15",
    createdAt: "2024-01-10",
    location: "San Francisco, CA",
    description: "Build React applications with TypeScript",
    customNotes: "Recruiter reached out via LinkedIn",
    priority: true,
  },
  {
    id: "2",
    title: "Backend Developer",
    company: "Globex Inc",
    stage: "Interview",
    lastActivityDate: "2024-01-14",
    createdAt: "2024-01-09",
    location: "New York, NY",
    description: "Design REST APIs and microservices",
    customNotes: "Need to prepare system design",
    priority: false,
  },
  {
    id: "3",
    title: "Full Stack Engineer",
    company: "Initech",
    stage: "Offer",
    lastActivityDate: "2024-01-13",
    createdAt: "2024-01-08",
    location: "Remote",
    description: "Work across the entire stack",
    priority: false,
  },
];

describe("searchJobs", () => {
  it("matches by title", () => {
    expect(searchJobs(jobs, "frontend")).toHaveLength(1);
    expect(searchJobs(jobs, "frontend")[0].id).toBe("1");
  });

  it("matches by company", () => {
    expect(searchJobs(jobs, "globex")).toHaveLength(1);
    expect(searchJobs(jobs, "globex")[0].id).toBe("2");
  });

  it("matches by location", () => {
    expect(searchJobs(jobs, "remote")).toHaveLength(1);
    expect(searchJobs(jobs, "remote")[0].id).toBe("3");
  });

  it("matches by description", () => {
    expect(searchJobs(jobs, "react")).toHaveLength(1);
    expect(searchJobs(jobs, "react")[0].id).toBe("1");
  });

  it("matches by customNotes", () => {
    expect(searchJobs(jobs, "linkedin")).toHaveLength(1);
    expect(searchJobs(jobs, "linkedin")[0].id).toBe("1");
  });

  it("returns all jobs when query is empty", () => {
    expect(searchJobs(jobs, "")).toHaveLength(3);
  });

  it("is case-insensitive", () => {
    expect(searchJobs(jobs, "ACME")).toHaveLength(1);
    expect(searchJobs(jobs, "ENGINEER")).toHaveLength(2);
  });

  it("returns empty array when no matches", () => {
    expect(searchJobs(jobs, "nonexistent")).toHaveLength(0);
  });

  it("matches partial words", () => {
    expect(searchJobs(jobs, "glob")).toHaveLength(1);
  });
});
