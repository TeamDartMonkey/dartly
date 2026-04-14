import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetSettings, mockUpsertSettings, mockRequireAuth } = vi.hoisted(() => ({
  mockGetSettings: vi.fn(),
  mockUpsertSettings: vi.fn(),
  mockRequireAuth: vi.fn(),
}));

vi.mock("@/lib/api-wrapper", () => ({
  withHttpLogging: vi.fn((_req: unknown, handler: () => unknown) => handler()),
}));

vi.mock("@/lib/requireAuth", () => ({
  requireAuth: mockRequireAuth,
}));

vi.mock("@/lib/logger", () => ({
  default: { info: vi.fn(), error: vi.fn() },
  logError: vi.fn(),
}));

vi.mock("@/services/settings", () => ({
  getSettings: mockGetSettings,
  upsertSettings: mockUpsertSettings,
}));

import { GET, PATCH } from "@/app/api/settings/route";

const mockUser = { id: "user-123" };
const defaultPrefs = {
  defaultJobStage: "INTERESTED",
  showArchived: false,
  dashboardView: "card" as const,
  autoArchiveRejected: false,
  autoArchiveRejectedDays: 30,
};

describe("GET /api/settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue(mockUser);
  });

  it("returns 401 when unauthenticated", async () => {
    const { ApiError } = await import("@/lib/api-error");
    mockRequireAuth.mockRejectedValue(new ApiError(401, "Unauthorized"));
    const req = new Request("http://localhost/api/settings") as NextRequest;
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns user preferences", async () => {
    mockGetSettings.mockResolvedValue(defaultPrefs);
    const req = new Request("http://localhost/api/settings") as NextRequest;
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(defaultPrefs);
  });
});

describe("PATCH /api/settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue(mockUser);
  });

  it("returns 401 when unauthenticated", async () => {
    const { ApiError } = await import("@/lib/api-error");
    mockRequireAuth.mockRejectedValue(new ApiError(401, "Unauthorized"));
    const req = new Request("http://localhost/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ showArchived: true }),
    }) as NextRequest;
    const res = await PATCH(req);
    expect(res.status).toBe(401);
  });

  it("updates and returns merged preferences", async () => {
    const updated = { ...defaultPrefs, showArchived: true };
    mockUpsertSettings.mockResolvedValue(updated);
    const req = new Request("http://localhost/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ showArchived: true }),
    }) as NextRequest;
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.showArchived).toBe(true);
  });

  it("returns 400 for invalid input", async () => {
    const req = new Request("http://localhost/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ autoArchiveRejectedDays: 999 }),
    }) as NextRequest;
    const res = await PATCH(req);
    expect(res.status).toBe(400);
  });
});
