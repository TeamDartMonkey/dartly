import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getUrgency, isOverdue } from "@/utils/deadline";

// Tests freeze "now" to local-noon of the asserted date so the local-day
// derivation in localTodayString() matches the test's expectations
// regardless of the runner's timezone.
function freezeLocalDate(year: number, monthIndex: number, day: number) {
  vi.setSystemTime(new Date(year, monthIndex, day, 12, 0, 0));
}

describe("isOverdue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns true when deadline is before today", () => {
    freezeLocalDate(2026, 3, 13); // April 13, 2026
    expect(isOverdue("2026-04-12")).toBe(true);
  });

  it("returns false when deadline is today", () => {
    freezeLocalDate(2026, 3, 13);
    expect(isOverdue("2026-04-13")).toBe(false);
  });

  it("returns false when deadline is in the future", () => {
    freezeLocalDate(2026, 3, 13);
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
    freezeLocalDate(2026, 3, 15);
    expect(getUrgency("2026-04-14")).toBe("overdue");
    expect(getUrgency("2026-04-10")).toBe("overdue");
  });

  it("returns 'due-soon' when deadline is within 7 days", () => {
    freezeLocalDate(2026, 3, 15);
    expect(getUrgency("2026-04-15")).toBe("due-soon");
    expect(getUrgency("2026-04-16")).toBe("due-soon");
    expect(getUrgency("2026-04-21")).toBe("due-soon");
    expect(getUrgency("2026-04-22")).toBe("due-soon");
  });

  it("returns 'upcoming' when deadline is more than 7 days away", () => {
    freezeLocalDate(2026, 3, 15);
    expect(getUrgency("2026-04-23")).toBe("upcoming");
    expect(getUrgency("2026-05-01")).toBe("upcoming");
  });
});
