import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockRequireAuth,
  mockCreateDocument,
  mockCreateClient,
  mockStorageUpload,
  mockVersionUpdate,
  mockDocUpdate,
} = vi.hoisted(() => ({
  mockRequireAuth: vi.fn(),
  mockCreateDocument: vi.fn(),
  mockCreateClient: vi.fn(),
  mockStorageUpload: vi.fn(),
  mockVersionUpdate: vi.fn(),
  mockDocUpdate: vi.fn(),
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

vi.mock("@/lib/env", () => ({
  env: { SUPABASE_DOCUMENTS_BUCKET: "documents" },
}));

vi.mock("@/lib/supabase-server", () => ({
  createClient: mockCreateClient,
}));

vi.mock("@/services/documents", () => ({
  createDocument: mockCreateDocument,
}));

vi.mock("@/services/prisma", () => ({
  prisma: {
    documentVersion: { update: mockVersionUpdate },
    document: { update: mockDocUpdate },
  },
}));

import { POST } from "@/app/api/documents/upload/route";

const USER_ID = "user-123";
const now = new Date("2026-01-01T00:00:00.000Z");
const baseDoc = {
  id: "doc-1",
  userId: USER_ID,
  type: "RESUME" as const,
  name: "Resume.pdf",
  status: "DRAFT" as const,
  isDeleted: false,
  deletedAt: null,
  createdAt: now,
  updatedAt: now,
  category: null,
};
const baseVersion = {
  id: "ver-1",
  documentId: "doc-1",
  versionNumber: 1,
  content: null,
  fileUrl: null,
  createdAt: now,
};

// jsdom's Request cannot parse multipart bodies, so we stub formData() directly.
function makeRequest(formData: StubForm): NextRequest {
  return {
    formData: async () => formData,
  } as unknown as NextRequest;
}

// Stub File-like object: route only needs name, type, size, arrayBuffer().
// Using a real File works under Node but not under Bun's vitest; this is portable.
type StubFile = {
  name: string;
  type: string;
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

function pdfFile(opts: { size?: number; type?: string; name?: string } = {}): StubFile {
  const size = opts.size ?? 1024;
  return {
    name: opts.name ?? "resume.pdf",
    type: opts.type ?? "application/pdf",
    size,
    arrayBuffer: async () => new ArrayBuffer(size),
  };
}

// Stub FormData with a get() that returns the values we set, mimicking the real API.
type StubForm = { get: (key: string) => unknown };

function buildForm(
  overrides: { file?: StubFile | null; type?: string | null; name?: string | null } = {}
): StubForm {
  const file = overrides.file === undefined ? pdfFile() : overrides.file;
  const type = overrides.type === null ? null : (overrides.type ?? "RESUME");
  const name = overrides.name === null ? null : (overrides.name ?? "Resume.pdf");

  return {
    get: (key: string) => {
      if (key === "file") return file ?? null;
      if (key === "type") return type;
      if (key === "name") return name;
      return null;
    },
  };
}

describe("POST /api/documents/upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue({ id: USER_ID });
    mockStorageUpload.mockResolvedValue({ error: null });
    mockCreateClient.mockResolvedValue({
      storage: {
        from: vi.fn().mockReturnValue({ upload: mockStorageUpload }),
      },
    });
    mockCreateDocument.mockResolvedValue({ doc: baseDoc, version: baseVersion });
    mockVersionUpdate.mockResolvedValue({ ...baseVersion, fileUrl: "path" });
    mockDocUpdate.mockResolvedValue({ ...baseDoc, status: "UPLOADED" });
  });

  it("returns 201 with UPLOADED document on valid PDF", async () => {
    const res = await POST(makeRequest(buildForm()));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.id).toBe("doc-1");
    expect(body.status).toBe("UPLOADED");
    expect(body.versionNumber).toBe(1);
    expect(mockCreateDocument).toHaveBeenCalledWith(USER_ID, {
      type: "RESUME",
      name: "Resume.pdf",
    });
    expect(mockVersionUpdate).toHaveBeenCalledWith({
      where: { id: "ver-1" },
      data: { fileUrl: expect.stringContaining(`${USER_ID}/`) },
    });
    expect(mockDocUpdate).toHaveBeenCalledWith({
      where: { id: "doc-1" },
      data: { status: "UPLOADED" },
    });
  });

  it("scopes the storage path under the authenticated user's id", async () => {
    await POST(makeRequest(buildForm()));

    const updateCall = mockVersionUpdate.mock.calls[0][0];
    expect(updateCall.data.fileUrl).toMatch(new RegExp(`^${USER_ID}/\\d+\\.pdf$`));
  });

  it("returns 400 when file is missing", async () => {
    const res = await POST(makeRequest(buildForm({ file: null })));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("File is required");
    expect(mockCreateDocument).not.toHaveBeenCalled();
  });

  it("returns 400 when type is missing", async () => {
    const res = await POST(makeRequest(buildForm({ type: null })));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Valid document type is required");
  });

  it("returns 400 when type is invalid", async () => {
    const res = await POST(makeRequest(buildForm({ type: "BOGUS" })));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Valid document type is required");
  });

  it("returns 400 when name is empty/whitespace", async () => {
    const res = await POST(makeRequest(buildForm({ name: "   " })));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Document name is required");
  });

  it("returns 400 when MIME type is not allowed", async () => {
    const res = await POST(makeRequest(buildForm({ file: pdfFile({ type: "text/plain" }) })));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/PDF/);
    expect(mockCreateDocument).not.toHaveBeenCalled();
  });

  it("returns 400 when file exceeds 10MB", async () => {
    const oversized = pdfFile({ size: 11 * 1024 * 1024 });
    const res = await POST(makeRequest(buildForm({ file: oversized })));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/10MB/);
    expect(mockStorageUpload).not.toHaveBeenCalled();
  });

  it("returns 401 when not authenticated", async () => {
    const { ApiError } = await import("@/lib/api-error");
    mockRequireAuth.mockRejectedValue(new ApiError(401, "Unauthorized"));

    const res = await POST(makeRequest(buildForm()));
    expect(res.status).toBe(401);
    expect(mockCreateDocument).not.toHaveBeenCalled();
  });

  it("returns 500 and does not create doc when storage upload fails", async () => {
    mockStorageUpload.mockResolvedValue({ error: { message: "boom" } });

    const res = await POST(makeRequest(buildForm()));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("File upload failed");
    expect(mockCreateDocument).not.toHaveBeenCalled();
  });
});
