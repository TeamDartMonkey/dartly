import { beforeEach, describe, expect, it, vi } from "vitest";

const mockTransaction = vi.fn();
const mockDocCreate = vi.fn();
const mockDocFindFirst = vi.fn();
const mockDocFindMany = vi.fn();
const mockDocUpdate = vi.fn();
const mockVersionCreate = vi.fn();
const mockVersionFindMany = vi.fn();
const mockJobFindFirst = vi.fn();
const mockLinkCreate = vi.fn();

const tx = {
  document: { create: mockDocCreate, update: mockDocUpdate },
  documentVersion: { create: mockVersionCreate },
  jobDocumentLink: { create: mockLinkCreate },
  job: { findFirst: mockJobFindFirst },
};

vi.mock("@/services/prisma", () => ({
  prisma: {
    $transaction: mockTransaction,
    document: {
      findFirst: mockDocFindFirst,
      findMany: mockDocFindMany,
      update: mockDocUpdate,
    },
    documentVersion: {
      create: mockVersionCreate,
      findMany: mockVersionFindMany,
    },
    job: { findFirst: mockJobFindFirst },
    jobDocumentLink: { create: mockLinkCreate },
  },
}));

const {
  createDocument,
  getDocumentById,
  softDeleteDocument,
  updateDocumentContent,
  toDocumentResponse,
  toVersionResponse,
} = await import("@/services/documents");

const now = new Date("2026-01-01T00:00:00.000Z");
const USER_ID = "user-1";

const baseDoc = {
  id: "doc-1",
  userId: USER_ID,
  type: "RESUME" as const,
  name: "My Resume",
  category: null,
  status: "DRAFT" as const,
  isDeleted: false,
  deletedAt: null,
  createdAt: now,
  updatedAt: now,
};

const baseVersion = {
  id: "ver-1",
  documentId: "doc-1",
  versionNumber: 1,
  content: "Resume content",
  fileUrl: null,
  createdAt: now,
};

function setupTransaction() {
  mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => fn(tx));
}

beforeEach(() => {
  vi.clearAllMocks();
  setupTransaction();
});

describe("toDocumentResponse", () => {
  it("maps Document + DocumentVersion to DocumentResponse", () => {
    const result = toDocumentResponse(baseDoc, baseVersion);

    expect(result).toEqual({
      id: "doc-1",
      type: "RESUME",
      name: "My Resume",
      status: "DRAFT",
      content: "Resume content",
      versionNumber: 1,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
  });

  it("omits content when version content is null", () => {
    const result = toDocumentResponse(baseDoc, { ...baseVersion, content: null });
    expect(result.content).toBeUndefined();
  });
});

describe("toVersionResponse", () => {
  it("maps DocumentVersion to DocumentVersionResponse", () => {
    const result = toVersionResponse(baseVersion);

    expect(result).toEqual({
      id: "ver-1",
      versionNumber: 1,
      content: "Resume content",
      createdAt: now.toISOString(),
    });
  });
});

describe("createDocument", () => {
  it("creates document with initial version in transaction", async () => {
    mockDocCreate.mockResolvedValue(baseDoc);
    mockVersionCreate.mockResolvedValue(baseVersion);

    const result = await createDocument(USER_ID, {
      type: "RESUME",
      name: "My Resume",
      content: "Resume content",
    });

    expect(result.doc).toEqual(baseDoc);
    expect(result.version).toEqual(baseVersion);
    expect(mockDocCreate).toHaveBeenCalledWith({
      data: { userId: USER_ID, type: "RESUME", name: "My Resume", status: "DRAFT" },
    });
    expect(mockVersionCreate).toHaveBeenCalledWith({
      data: { documentId: "doc-1", versionNumber: 1, content: "Resume content" },
    });
  });

  it("links document to job when jobId is provided", async () => {
    mockDocCreate.mockResolvedValue(baseDoc);
    mockVersionCreate.mockResolvedValue(baseVersion);
    mockJobFindFirst.mockResolvedValue({ id: "job-1", userId: USER_ID });

    await createDocument(USER_ID, {
      type: "RESUME",
      name: "My Resume",
      jobId: "job-1",
    });

    expect(mockLinkCreate).toHaveBeenCalledWith({
      data: { jobId: "job-1", documentId: "doc-1", documentVersionId: "ver-1" },
    });
  });
});

describe("getDocumentById", () => {
  it("returns null when document not found", async () => {
    mockDocFindFirst.mockResolvedValue(null);
    const result = await getDocumentById("doc-999", USER_ID);
    expect(result).toBeNull();
  });

  it("returns null when document has no versions", async () => {
    mockDocFindFirst.mockResolvedValue({ ...baseDoc, versions: [] });
    const result = await getDocumentById("doc-1", USER_ID);
    expect(result).toBeNull();
  });
});

describe("softDeleteDocument", () => {
  it("returns true after soft-deleting", async () => {
    mockDocFindFirst.mockResolvedValue(baseDoc);
    mockDocUpdate.mockResolvedValue({ ...baseDoc, isDeleted: true });

    const result = await softDeleteDocument("doc-1", USER_ID);
    expect(result).toBe(true);
    expect(mockDocUpdate).toHaveBeenCalledWith({
      where: { id: "doc-1" },
      data: { isDeleted: true, deletedAt: expect.any(Date) },
    });
  });

  it("returns false when document not found", async () => {
    mockDocFindFirst.mockResolvedValue(null);
    const result = await softDeleteDocument("doc-999", USER_ID);
    expect(result).toBe(false);
  });
});

describe("updateDocumentContent", () => {
  it("returns null when document not found", async () => {
    mockDocFindFirst.mockResolvedValue(null);
    const result = await updateDocumentContent("doc-999", USER_ID, "new content");
    expect(result).toBeNull();
  });
});
