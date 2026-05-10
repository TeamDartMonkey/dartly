import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockUpdateDocumentTags, mockRequireAuth, mockValidateBody } = vi.hoisted(() => ({
  mockUpdateDocumentTags: vi.fn(),
  mockRequireAuth: vi.fn(),
  mockValidateBody: vi.fn(),
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

vi.mock("@/lib/validate-body", () => ({
  validateBody: mockValidateBody,
}));

vi.mock("@/services/documents", () => ({
  updateDocumentTags: mockUpdateDocumentTags,
}));

import { PUT } from "@/app/api/documents/[id]/tags/route";

const mockUser = { id: "user-123" };

function makeRequest(body: unknown): NextRequest {
  return new Request("http://localhost/api/documents/doc-1/tags", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

const context = { params: Promise.resolve({ id: "doc-1" }) };

const baseDocResponse = {
  id: "doc-1",
  type: "RESUME" as const,
  name: "My Resume",
  status: "DRAFT" as const,
  tags: ["Backend", "Frontend"],
  versionNumber: 1,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("PUT /api/documents/[id]/tags", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue(mockUser);
  });

  it("returns 200 with the updated document on success", async () => {
    mockValidateBody.mockResolvedValue({ tags: ["Frontend", "Backend"] });
    mockUpdateDocumentTags.mockResolvedValue(baseDocResponse);

    const res = await PUT(makeRequest({ tags: ["Frontend", "Backend"] }), context);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.tags).toEqual(["Backend", "Frontend"]);
    expect(mockUpdateDocumentTags).toHaveBeenCalledWith("doc-1", mockUser.id, [
      "Frontend",
      "Backend",
    ]);
  });

  it("scopes the update to the authenticated user", async () => {
    mockValidateBody.mockResolvedValue({ tags: ["X"] });
    mockUpdateDocumentTags.mockResolvedValue(baseDocResponse);

    await PUT(makeRequest({ tags: ["X"] }), context);

    const [, userId] = mockUpdateDocumentTags.mock.calls[0];
    expect(userId).toBe(mockUser.id);
  });

  it("returns 404 when the document is not found", async () => {
    mockValidateBody.mockResolvedValue({ tags: [] });
    mockUpdateDocumentTags.mockResolvedValue(null);

    const res = await PUT(makeRequest({ tags: [] }), context);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("Document not found");
  });

  it("returns 401 when unauthenticated", async () => {
    const { ApiError } = await import("@/lib/api-error");
    mockRequireAuth.mockRejectedValue(new ApiError(401, "Unauthorized"));

    const res = await PUT(makeRequest({ tags: [] }), context);

    expect(res.status).toBe(401);
    expect(mockUpdateDocumentTags).not.toHaveBeenCalled();
  });

  it("returns 400 from validation when input is invalid", async () => {
    const { ApiError } = await import("@/lib/api-error");
    mockValidateBody.mockRejectedValue(new ApiError(400, "Invalid tags"));

    const res = await PUT(makeRequest({ tags: "not an array" }), context);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Invalid tags");
    expect(mockUpdateDocumentTags).not.toHaveBeenCalled();
  });

  it("returns 500 on unexpected service error", async () => {
    mockValidateBody.mockResolvedValue({ tags: ["x"] });
    mockUpdateDocumentTags.mockRejectedValue(new Error("DB connection lost"));

    const res = await PUT(makeRequest({ tags: ["x"] }), context);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("Internal server error");
  });
});
