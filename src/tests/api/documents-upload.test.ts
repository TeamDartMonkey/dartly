import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockRequireAuth,
  mockCreateClient,
  mockStorageUpload,
  mockStorageRemove,
  mockTransaction,
  mockDocCreate,
  mockVersionCreate,
} = vi.hoisted(() => ({
  mockRequireAuth: vi.fn(),
  mockCreateClient: vi.fn(),
  mockStorageUpload: vi.fn(),
  mockStorageRemove: vi.fn(),
  mockTransaction: vi.fn(),
  mockDocCreate: vi.fn(),
  mockVersionCreate: vi.fn(),
}));

vi.mock("@/lib/api-wrapper", () => ({
  withHttpLogging: vi.fn((_req: unknown, handler: () => unknown) => handler()),
}));

vi.mock("@/lib/requireAuth", () => ({
  requireAuth: mockRequireAuth,
}));

vi.mock("@/lib/logger", () => ({
  default: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
  logError: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  env: { SUPABASE_DOCUMENTS_BUCKET: "documents" },
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/supabase-server", () => ({
  createClient: mockCreateClient,
}));

vi.mock("@/services/prisma", () => ({
  prisma: {
    $transaction: mockTransaction,
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
  status: "UPLOADED" as const,
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
  fileUrl: "user-123/123.pdf",
  createdAt: now,
};

// jsdom's Request cannot parse multipart bodies, so we stub formData() directly.
// We also stub headers.get so the Content-Length pre-check in the route works.
function makeRequest(formData: StubForm, contentLength?: number): NextRequest {
  return {
    formData: async () => formData,
    headers: {
      get: (name: string) =>
        name.toLowerCase() === "content-length" && contentLength !== undefined
          ? String(contentLength)
          : null,
    },
  } as unknown as NextRequest;
}

type StubFile = {
  name: string;
  type: string;
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

// Real-PDF-like buffer must start with the magic bytes "%PDF-".
function pdfFile(opts: { size?: number; type?: string; name?: string; magic?: boolean } = {}): StubFile {
  const size = opts.size ?? 1024;
  const useMagic = opts.magic !== false;
  return {
    name: opts.name ?? "resume.pdf",
    type: opts.type ?? "application/pdf",
    size,
    arrayBuffer: async () => {
      const buf = new Uint8Array(size);
      if (useMagic) {
        const magic = new TextEncoder().encode("%PDF-");
        buf.set(magic, 0);
      }
      return buf.buffer;
    },
  };
}

// File-like inputs that satisfy `instanceof File` for the route's guard
// AND provide a working `arrayBuffer()` method (jsdom's File polyfill in
// the test runtime does not).
function asFile(stub: StubFile): File {
  const bytes = new Uint8Array(stub.size);
  if (stub.size >= 5) {
    bytes.set(new TextEncoder().encode("%PDF-"), 0);
  }
  const f = new File([bytes], stub.name, { type: stub.type });
  // Polyfill arrayBuffer if the host File lacks it.
  if (typeof f.arrayBuffer !== "function") {
    Object.defineProperty(f, "arrayBuffer", {
      value: async () => bytes.buffer,
      writable: true,
    });
  }
  return f;
}

type StubForm = { get: (key: string) => unknown };

function buildForm(
  overrides: { file?: StubFile | File | null; type?: string | null; name?: string | null } = {}
): StubForm {
  let file: File | null;
  if (overrides.file === null) {
    file = null;
  } else if (overrides.file === undefined) {
    file = asFile(pdfFile());
  } else if (overrides.file instanceof File) {
    file = overrides.file;
  } else {
    file = asFile(overrides.file);
  }

  const type = overrides.type === null ? null : (overrides.type ?? "RESUME");
  const name = overrides.name === null ? null : (overrides.name ?? "Resume.pdf");

  return {
    get: (key: string) => {
      if (key === "file") return file;
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
    mockStorageRemove.mockResolvedValue({ error: null });
    mockCreateClient.mockResolvedValue({
      storage: {
        from: vi.fn().mockReturnValue({
          upload: mockStorageUpload,
          remove: mockStorageRemove,
        }),
      },
    });
    const tx = {
      document: { create: mockDocCreate },
      documentVersion: { create: mockVersionCreate },
    };
    mockTransaction.mockImplementation(async (cb: (t: typeof tx) => Promise<unknown>) => cb(tx));
    mockDocCreate.mockResolvedValue(baseDoc);
    mockVersionCreate.mockResolvedValue(baseVersion);
  });

  it("returns 201 with UPLOADED document on valid PDF", async () => {
    const res = await POST(makeRequest(buildForm()));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.id).toBe("doc-1");
    expect(body.status).toBe("UPLOADED");
    expect(body.versionNumber).toBe(1);
    expect(mockDocCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "UPLOADED" }) })
    );
  });

  it("scopes the storage path under the authenticated user's id", async () => {
    await POST(makeRequest(buildForm()));
    const uploadCall = mockStorageUpload.mock.calls[0];
    expect(uploadCall[0]).toMatch(new RegExp(`^${USER_ID}/\\d+\\.pdf$`));
  });

  it("returns 400 when file is missing", async () => {
    const res = await POST(makeRequest(buildForm({ file: null })));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("File is required");
    expect(mockStorageUpload).not.toHaveBeenCalled();
  });

  it("returns 400 when type is missing", async () => {
    const res = await POST(makeRequest(buildForm({ type: null })));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/type/i);
  });

  it("returns 400 when type is invalid", async () => {
    const res = await POST(makeRequest(buildForm({ type: "BOGUS" })));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/type/i);
  });

  it("returns 400 when name is empty/whitespace", async () => {
    const res = await POST(makeRequest(buildForm({ name: "   " })));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/name/i);
  });

  it("returns 400 when MIME type is not allowed", async () => {
    const res = await POST(
      makeRequest(buildForm({ file: asFile(pdfFile({ type: "text/plain" })) }))
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/PDF/);
    expect(mockStorageUpload).not.toHaveBeenCalled();
  });

  it("returns 400 when magic bytes don't match PDF", async () => {
    const bytes = new Uint8Array([0, 1, 2, 3, 4, 5]);
    const fakePdf = new File([bytes], "fake.pdf", { type: "application/pdf" });
    if (typeof fakePdf.arrayBuffer !== "function") {
      Object.defineProperty(fakePdf, "arrayBuffer", {
        value: async () => bytes.buffer,
        writable: true,
      });
    }
    const res = await POST(makeRequest(buildForm({ file: fakePdf })));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/valid PDF/);
    expect(mockStorageUpload).not.toHaveBeenCalled();
  });

  it("returns 400 when file exceeds 10MB", async () => {
    // Construct a file that reports >10MB size without actually allocating it.
    const big = {
      name: "huge.pdf",
      type: "application/pdf",
      size: 11 * 1024 * 1024,
      arrayBuffer: async () => new ArrayBuffer(0),
      lastModified: Date.now(),
      webkitRelativePath: "",
      slice: () => new Blob(),
      stream: () => new ReadableStream(),
      text: async () => "",
      bytes: async () => new Uint8Array(),
    } as unknown as File;
    Object.setPrototypeOf(big, File.prototype);
    const res = await POST(makeRequest(buildForm({ file: big })));
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
    expect(mockStorageUpload).not.toHaveBeenCalled();
  });

  it("returns 500 and removes the storage object when DB write fails", async () => {
    mockTransaction.mockRejectedValue(new Error("DB blew up"));

    const res = await POST(makeRequest(buildForm()));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("Document upload failed");
    expect(mockStorageRemove).toHaveBeenCalled();
  });

  it("returns 500 when storage upload fails", async () => {
    mockStorageUpload.mockResolvedValue({ error: { message: "boom" } });

    const res = await POST(makeRequest(buildForm()));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("File upload failed");
    expect(mockTransaction).not.toHaveBeenCalled();
  });
});
