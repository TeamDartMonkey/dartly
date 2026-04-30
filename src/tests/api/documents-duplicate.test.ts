import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockDuplicateDocument, mockRequireAuth } = vi.hoisted(() => ({
  mockDuplicateDocument: vi.fn(),
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

vi.mock("@/services/documents", () => ({
  duplicateDocument: mockDuplicateDocument,
}));

import { POST } from "@/app/api/documents/[id]/duplicate/route";

const mockUser = { id: "user-123" };
const mockDocResponse = {
  id: "doc-2",
  type: "RESUME",
  name: "Copy of My Resume",
  status: "DRAFT",
  content: "Resume content",
  versionNumber: 1,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function makeRequest(): NextRequest {
  return new Request("http://localhost/api/documents/doc-1/duplicate", {
    method: "POST",
  }) as unknown as NextRequest;
}

const context = { params: Promise.resolve({ id: "doc-1" }) };

describe("POST /api/documents/[id]/duplicate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue(mockUser);
  });

  it("returns 201 with duplicated document", async () => {
    mockDuplicateDocument.mockResolvedValue(mockDocResponse);

    const res = await POST(makeRequest(), context);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.id).toBe("doc-2");
    expect(body.name).toBe("Copy of My Resume");
    expect(mockDuplicateDocument).toHaveBeenCalledWith("doc-1", mockUser.id);
  });

  it("prefixes the duplicated document name with 'Copy of'", async () => {
    mockDuplicateDocument.mockResolvedValue(mockDocResponse);

    const res = await POST(makeRequest(), context);
    const body = await res.json();

    expect(body.name).toMatch(/^Copy of /);
  });

  it("returns 404 when source document not found", async () => {
    mockDuplicateDocument.mockResolvedValue(null);

    const res = await POST(makeRequest(), context);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("Document not found");
    expect(mockDuplicateDocument).toHaveBeenCalledWith("doc-1", mockUser.id);
  });

  it("returns 401 when not authenticated", async () => {
    const { ApiError } = await import("@/lib/api-error");
    mockRequireAuth.mockRejectedValue(new ApiError(401, "Unauthorized"));

    const res = await POST(makeRequest(), context);
    expect(res.status).toBe(401);
    expect(mockDuplicateDocument).not.toHaveBeenCalled();
  });

  it("scopes duplication to the authenticated user and does not touch other users' documents", async () => {
    mockDuplicateDocument.mockResolvedValue(null);

    await POST(makeRequest(), context);

    expect(mockDuplicateDocument).toHaveBeenCalledWith("doc-1", mockUser.id);
  });

  it("returns 500 on unexpected service error", async () => {
    mockDuplicateDocument.mockRejectedValue(new Error("DB connection lost"));

    const res = await POST(makeRequest(), context);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("Internal server error");
  });
});
