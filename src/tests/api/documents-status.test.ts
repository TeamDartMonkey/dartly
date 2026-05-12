import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockUpdateDocumentStatus, mockRequireAuth, mockValidateBody } = vi.hoisted(() => ({
  mockUpdateDocumentStatus: vi.fn(),
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
  updateDocumentStatus: mockUpdateDocumentStatus,
}));

import { PATCH } from "@/app/api/documents/[id]/status/route";

const mockUser = { id: "user-123" };
const mockDocResponse = {
  id: "doc-1",
  type: "RESUME",
  name: "My Resume",
  status: "READY",
  content: "Resume content",
  versionNumber: 1,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function makeRequest(body: object): NextRequest {
  return new Request("http://localhost/api/documents/doc-1/status", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

const context = { params: Promise.resolve({ id: "doc-1" }) };

describe("PATCH /api/documents/[id]/status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue(mockUser);
  });

  it("returns 200 with updated document", async () => {
    const updated = { ...mockDocResponse, status: "READY" };
    mockUpdateDocumentStatus.mockResolvedValue(updated);
    mockValidateBody.mockResolvedValue({ status: "READY" });

    const res = await PATCH(makeRequest({ status: "READY" }), context);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe("READY");
    expect(mockUpdateDocumentStatus).toHaveBeenCalledWith("doc-1", mockUser.id, "READY");
  });

  it("returns 404 when document not found", async () => {
    mockUpdateDocumentStatus.mockResolvedValue(null);
    mockValidateBody.mockResolvedValue({ status: "DRAFT" });

    const res = await PATCH(makeRequest({ status: "DRAFT" }), context);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("Document not found");
  });

  it("returns 400 for invalid status value", async () => {
    const { ApiError } = await import("@/lib/api-error");
    mockValidateBody.mockRejectedValue(new ApiError(400, "Invalid status"));

    const res = await PATCH(makeRequest({ status: "INVALID" }), context);
    expect(res.status).toBe(400);
    expect(mockUpdateDocumentStatus).not.toHaveBeenCalled();
  });

  it("returns 401 when not authenticated", async () => {
    const { ApiError } = await import("@/lib/api-error");
    mockRequireAuth.mockRejectedValue(new ApiError(401, "Unauthorized"));

    const res = await PATCH(makeRequest({ status: "READY" }), context);
    expect(res.status).toBe(401);
    expect(mockUpdateDocumentStatus).not.toHaveBeenCalled();
  });
});
