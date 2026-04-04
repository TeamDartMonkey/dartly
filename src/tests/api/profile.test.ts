import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetProfile, mockUpsertProfile, mockRequireAuth } = vi.hoisted(() => ({
  mockGetProfile: vi.fn(),
  mockUpsertProfile: vi.fn(),
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
}));

vi.mock("@/services/profile", () => ({
  getProfile: mockGetProfile,
  upsertProfile: mockUpsertProfile,
}));

import { GET, PUT } from "@/app/api/profile/route";

const mockUser = { id: "user-123" };
const mockProfile = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  phone: null,
  location: null,
  headline: null,
  summary: null,
  targetRoles: [],
  targetLocations: [],
  workModePreference: null,
  salaryPreference: null,
  experiences: [],
  educations: [],
  skills: [],
};

function makeRequest(method: string, body?: object): NextRequest {
  return new Request("http://localhost/api/profile", {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  }) as unknown as NextRequest;
}

describe("GET /api/profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue(mockUser);
  });

  it("returns 200 with profile data", async () => {
    mockGetProfile.mockResolvedValue(mockProfile);

    const res = await GET(makeRequest("GET"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.firstName).toBe("Jane");
  });

  it("returns 200 with empty object when no profile exists", async () => {
    mockGetProfile.mockResolvedValue(null);

    const res = await GET(makeRequest("GET"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({});
  });

  it("returns 401 when not authenticated", async () => {
    const { ApiError } = await import("@/lib/api-error");
    mockRequireAuth.mockRejectedValue(new ApiError(401, "Unauthorized"));

    const res = await GET(makeRequest("GET"));
    expect(res.status).toBe(401);
  });
});

describe("PUT /api/profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue(mockUser);
  });

  it("returns 200 with updated profile", async () => {
    mockUpsertProfile.mockResolvedValue(mockProfile);

    const res = await PUT(makeRequest("PUT", { firstName: "Jane" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.firstName).toBe("Jane");
    expect(mockUpsertProfile).toHaveBeenCalledWith("user-123", { firstName: "Jane" });
  });

  it("returns 401 when not authenticated", async () => {
    const { ApiError } = await import("@/lib/api-error");
    mockRequireAuth.mockRejectedValue(new ApiError(401, "Unauthorized"));

    const res = await PUT(makeRequest("PUT", { firstName: "Jane" }));
    expect(res.status).toBe(401);
  });
});
