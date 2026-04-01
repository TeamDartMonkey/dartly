import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetUser = vi.fn();

vi.mock("@/lib/supabase-server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: mockGetUser,
    },
  }),
}));

vi.mock("@/lib/logger", () => ({
  childLogger: () => ({
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
}));

import { requireAuth } from "@/lib/require-auth";
import { ApiError } from "@/lib/api-error";

describe("requireAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the authenticated user when session is valid", async () => {
    const mockUser = { id: "user-123", email: "test@example.com" };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const user = await requireAuth();

    expect(user).toEqual(mockUser);
    expect(user.id).toBe("user-123");
  });

  it("throws ApiError 401 when no user in session", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    await expect(requireAuth()).rejects.toThrow(ApiError);
    await expect(requireAuth()).rejects.toThrow("Unauthorized");

    try {
      await requireAuth();
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).statusCode).toBe(401);
    }
  });

  it("throws ApiError 401 when supabase returns an error", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: "Invalid token" },
    });

    await expect(requireAuth()).rejects.toThrow(ApiError);

    try {
      await requireAuth();
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).statusCode).toBe(401);
    }
  });

  it("throws ApiError 401 when both user is null and error exists", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: "Session expired" },
    });

    try {
      await requireAuth();
      expect.fail("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).statusCode).toBe(401);
      expect((error as ApiError).message).toBe("Unauthorized");
    }
  });
});
