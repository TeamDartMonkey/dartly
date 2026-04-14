import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useViewMode } from "@/hooks/use-view-mode";

describe("useViewMode", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to card mode", () => {
    const { result } = renderHook(() => useViewMode());
    expect(result.current[0]).toBe("card");
  });

  it("reads persisted mode from localStorage", () => {
    localStorage.setItem("dartly-dashboard-view", "list");
    const { result } = renderHook(() => useViewMode());
    expect(result.current[0]).toBe("list");
  });

  it("ignores invalid localStorage values", () => {
    localStorage.setItem("dartly-dashboard-view", "table");
    const { result } = renderHook(() => useViewMode());
    expect(result.current[0]).toBe("card");
  });

  it("updates mode and persists to localStorage", () => {
    const { result } = renderHook(() => useViewMode());
    act(() => result.current[1]("list"));
    expect(result.current[0]).toBe("list");
    expect(localStorage.getItem("dartly-dashboard-view")).toBe("list");
  });

  it("can switch back to card mode", () => {
    localStorage.setItem("dartly-dashboard-view", "list");
    const { result } = renderHook(() => useViewMode());
    act(() => result.current[1]("card"));
    expect(result.current[0]).toBe("card");
    expect(localStorage.getItem("dartly-dashboard-view")).toBe("card");
  });
});
