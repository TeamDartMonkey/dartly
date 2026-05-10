import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockRequireAuth, mockCreateClient, mockCreateSignedUrl, mockDocFindFirst } = vi.hoisted(
  () => ({
    mockRequireAuth: vi.fn(),
    mockCreateClient: vi.fn(),
    mockCreateSignedUrl: vi.fn(),
    mockDocFindFirst: vi.fn(),
  })
);

vi.mock("@/lib/api-wrapper", () => ({
  withHttpLogging: vi.fn((_req: unknown, handler: () => unknown) => handler()),
}));

vi.mock("@/lib/requireAuth", () => ({
  requireAuth: mockRequireAuth,
}));

vi.mock("@/lib/logger", () => ({
  default: { info: vi.fn(), error: vi.fn() },
}));

vi.mock("@/lib/env", () => ({
  env: { SUPABASE_DOCUMENTS_BUCKET: "documents" },
}));

vi.mock("@/lib/supabase-server", () => ({
  createClient: mockCreateClient,
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/services/prisma", () => ({
  prisma: {
    document: { findFirst: mockDocFindFirst },
  },
}));

import { GET } from "@/app/api/documents/[id]/signed-url/route";

const USER_ID = "user-123";
const now = new Date("2026-01-01T00:00:00.000Z");

function makeRequest(): NextRequest {
  return new Request("http://localhost/api/documents/doc-1/signed-url", {
    method: "GET",
  }) as unknown as NextRequest;
}

const context = { params: Promise.resolve({ id: "doc-1" }) };

describe("GET /api/documents/[id]/signed-url", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue({ id: USER_ID });
    mockCreateClient.mockResolvedValue({
      storage: {
        from: vi.fn().mockReturnValue({ createSignedUrl: mockCreateSignedUrl }),
      },
    });
  });

  it("returns 200 with signed URL when document is owned and has a file version", async () => {
    mockDocFindFirst.mockResolvedValue({
      id: "doc-1",
      userId: USER_ID,
      isDeleted: false,
      versions: [{ id: "ver-1", fileUrl: `${USER_ID}/123.pdf`, versionNumber: 1, createdAt: now }],
    });
    mockCreateSignedUrl.mockResolvedValue({
      data: { signedUrl: "https://example.com/signed" },
      error: null,
    });

    const res = await GET(makeRequest(), context);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.url).toBe("https://example.com/signed");
    expect(mockCreateSignedUrl).toHaveBeenCalledWith(`${USER_ID}/123.pdf`, 5 * 60);
  });

  it("scopes the lookup by userId so other users cannot retrieve the URL", async () => {
    mockDocFindFirst.mockResolvedValue(null);

    const res = await GET(makeRequest(), context);
    expect(res.status).toBe(404);
    expect(mockDocFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: "doc-1", userId: USER_ID, isDeleted: false }),
      })
    );
    expect(mockCreateSignedUrl).not.toHaveBeenCalled();
  });

  it("returns 404 when the document has no version with a fileUrl", async () => {
    mockDocFindFirst.mockResolvedValue({
      id: "doc-1",
      userId: USER_ID,
      isDeleted: false,
      versions: [],
    });

    const res = await GET(makeRequest(), context);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("Not found");
    expect(mockCreateSignedUrl).not.toHaveBeenCalled();
  });

  it("returns 401 when not authenticated", async () => {
    const { ApiError } = await import("@/lib/api-error");
    mockRequireAuth.mockRejectedValue(new ApiError(401, "Unauthorized"));

    const res = await GET(makeRequest(), context);
    expect(res.status).toBe(401);
    expect(mockDocFindFirst).not.toHaveBeenCalled();
  });

  it("returns 500 when supabase fails to generate the URL", async () => {
    mockDocFindFirst.mockResolvedValue({
      id: "doc-1",
      userId: USER_ID,
      isDeleted: false,
      versions: [{ id: "ver-1", fileUrl: `${USER_ID}/x.pdf`, versionNumber: 1, createdAt: now }],
    });
    mockCreateSignedUrl.mockResolvedValue({ data: null, error: { message: "boom" } });

    const res = await GET(makeRequest(), context);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("Could not generate signed URL");
  });
});
