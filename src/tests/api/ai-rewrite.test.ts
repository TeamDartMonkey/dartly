import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockRequireAuth, mockValidateBody, mockRewriteContent, mockGetDocumentById } = vi.hoisted(
  () => ({
    mockRequireAuth: vi.fn(),
    mockValidateBody: vi.fn(),
    mockRewriteContent: vi.fn(),
    mockGetDocumentById: vi.fn(),
  })
);

vi.mock("@/lib/api-wrapper", () => ({
  withHttpLogging: vi.fn((_req: unknown, handler: () => unknown) => handler()),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue(null),
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

vi.mock("@/services/ai", () => ({
  rewriteContent: mockRewriteContent,
}));

vi.mock("@/services/documents", () => ({
  getDocumentById: mockGetDocumentById,
}));

import { POST } from "@/app/api/ai/rewrite/route";

const mockUser = { id: "user-123" };

function makeRequest(body = { documentId: "doc-1", instruction: "shorten" }): NextRequest {
  return new Request("http://localhost/api/ai/rewrite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

describe("POST /api/ai/rewrite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue(mockUser);
    mockValidateBody.mockResolvedValue({ documentId: "doc-1", instruction: "shorten" });
    mockGetDocumentById.mockResolvedValue({
      id: "doc-1",
      content: "Original content here",
    });
    mockRewriteContent.mockResolvedValue({ content: "Shortened content" });
  });

  it("returns 200 with original and rewritten content", async () => {
    const res = await POST(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.original).toBe("Original content here");
    expect(body.rewritten).toBe("Shortened content");
    expect(mockRewriteContent).toHaveBeenCalledWith({
      content: "Original content here",
      instruction: "shorten",
    });
  });

  it("returns 404 when document not found", async () => {
    mockGetDocumentById.mockResolvedValue(null);

    const res = await POST(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("Document not found");
  });

  it("returns 400 when document has no content", async () => {
    mockGetDocumentById.mockResolvedValue({ id: "doc-1", content: null });

    const res = await POST(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Document has no content to rewrite");
  });

  it("returns 401 when not authenticated", async () => {
    const { ApiError } = await import("@/lib/api-error");
    mockRequireAuth.mockRejectedValue(new ApiError(401, "Unauthorized"));

    const res = await POST(makeRequest());
    expect(res.status).toBe(401);
  });

  it("returns 429 when rate limited without invoking auth or AI", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const { NextResponse } = await import("next/server");
    vi.mocked(checkRateLimit).mockResolvedValueOnce(
      NextResponse.json({ error: "Too many requests" }, { status: 429 })
    );

    const res = await POST(makeRequest());

    expect(res.status).toBe(429);
    expect(mockRequireAuth).not.toHaveBeenCalled();
    expect(mockRewriteContent).not.toHaveBeenCalled();
  });
});
