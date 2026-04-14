import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isOverdue } from "@/utils/deadline";

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
