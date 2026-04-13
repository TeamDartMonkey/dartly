import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetDocumentById,
  mockSoftDeleteDocument,
  mockUpdateDocumentContent,
  mockRequireAuth,
  mockValidateBody,
} = vi.hoisted(() => ({
  mockGetDocumentById: vi.fn(),
  mockSoftDeleteDocument: vi.fn(),
  mockUpdateDocumentContent: vi.fn(),
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
}));

vi.mock("@/lib/validate-body", () => ({
  validateBody: mockValidateBody,
}));

vi.mock("@/services/documents", () => ({
  getDocumentById: mockGetDocumentById,
  softDeleteDocument: mockSoftDeleteDocument,
  updateDocumentContent: mockUpdateDocumentContent,
}));

import { DELETE, GET, PUT } from "@/app/api/documents/[id]/route";

const mockUser = { id: "user-123" };
const mockDocResponse = {
  id: "doc-1",
  type: "RESUME",
  name: "My Resume",
  status: "DRAFT",
  content: "Resume content",
  versionNumber: 1,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function makeRequest(method: string, body?: object): NextRequest {
  return new Request("http://localhost/api/documents/doc-1", {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  }) as unknown as NextRequest;
}

const context = { params: Promise.resolve({ id: "doc-1" }) };

describe("GET /api/documents/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue(mockUser);
  });

  it("returns 200 with document", async () => {
    mockGetDocumentById.mockResolvedValue(mockDocResponse);

    const res = await GET(makeRequest("GET"), context);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(mockDocResponse);
  });

  it("returns 404 when document not found", async () => {
    mockGetDocumentById.mockResolvedValue(null);

    const res = await GET(makeRequest("GET"), context);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("Document not found");
  });

  it("returns 401 when not authenticated", async () => {
    const { ApiError } = await import("@/lib/api-error");
    mockRequireAuth.mockRejectedValue(new ApiError(401, "Unauthorized"));

    const res = await GET(makeRequest("GET"), context);
    expect(res.status).toBe(401);
  });
});

describe("PUT /api/documents/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue(mockUser);
    mockValidateBody.mockResolvedValue({ content: "Updated content" });
  });

  it("returns 200 with updated document", async () => {
    const updated = { ...mockDocResponse, content: "Updated content", versionNumber: 2 };
    mockUpdateDocumentContent.mockResolvedValue(updated);

    const res = await PUT(makeRequest("PUT", { content: "Updated content" }), context);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.versionNumber).toBe(2);
  });

  it("returns 404 when document not found", async () => {
    mockUpdateDocumentContent.mockResolvedValue(null);

    const res = await PUT(makeRequest("PUT", { content: "x" }), context);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("Document not found");
  });
});

describe("DELETE /api/documents/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue(mockUser);
  });

  it("returns 204 when document is soft-deleted", async () => {
    mockSoftDeleteDocument.mockResolvedValue(true);

    const res = await DELETE(makeRequest("DELETE"), context);
    expect(res.status).toBe(204);
  });

  it("returns 404 when document not found", async () => {
    mockSoftDeleteDocument.mockResolvedValue(false);

    const res = await DELETE(makeRequest("DELETE"), context);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("Document not found");
  });

  it("returns 401 when not authenticated", async () => {
    const { ApiError } = await import("@/lib/api-error");
    mockRequireAuth.mockRejectedValue(new ApiError(401, "Unauthorized"));

    const res = await DELETE(makeRequest("DELETE"), context);
    expect(res.status).toBe(401);
  });
});
