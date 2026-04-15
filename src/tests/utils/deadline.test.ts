import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getUrgency, isOverdue } from "@/utils/deadline";

describe("isOverdue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns true when deadline is before today", () => {
    vi.setSystemTime("2026-04-13");
    expect(isOverdue("2026-04-12")).toBe(true);
  });

  it("returns false when deadline is today", () => {
    vi.setSystemTime("2026-04-13");
    expect(isOverdue("2026-04-13")).toBe(false);
  });

  it("returns false when deadline is in the future", () => {
    vi.setSystemTime("2026-04-13");
    expect(isOverdue("2026-04-20")).toBe(false);
  });
});

describe("getUrgency", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'none' when no deadline is provided", () => {
    expect(getUrgency()).toBe("none");
    expect(getUrgency(undefined)).toBe("none");
  });

  it("returns 'overdue' when deadline is in the past", () => {
    vi.setSystemTime("2026-04-15");
    expect(getUrgency("2026-04-14")).toBe("overdue");
    expect(getUrgency("2026-04-10")).toBe("overdue");
  });

  it("returns 'due-soon' when deadline is within 7 days", () => {
    vi.setSystemTime("2026-04-15");
    expect(getUrgency("2026-04-15")).toBe("due-soon");
    expect(getUrgency("2026-04-16")).toBe("due-soon");
    expect(getUrgency("2026-04-21")).toBe("due-soon");
    expect(getUrgency("2026-04-22")).toBe("due-soon");
  });

  it("returns 'upcoming' when deadline is more than 7 days away", () => {
    vi.setSystemTime("2026-04-15");
    expect(getUrgency("2026-04-23")).toBe("upcoming");
    expect(getUrgency("2026-05-01")).toBe("upcoming");
  });
});
