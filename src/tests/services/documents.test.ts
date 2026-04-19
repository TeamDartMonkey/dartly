import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/logger", () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  logError: vi.fn(),
}));

const mockTransaction = vi.fn();
const mockDocCreate = vi.fn();
const mockDocFindFirst = vi.fn();
const mockDocFindMany = vi.fn();
const mockDocUpdate = vi.fn();
const mockVersionCreate = vi.fn();
const mockVersionFindMany = vi.fn();
const mockVersionAggregate = vi.fn();
const mockJobFindFirst = vi.fn();
const mockLinkCreate = vi.fn();
const mockLinkFindMany = vi.fn();

const tx = {
  document: { create: mockDocCreate, findFirst: mockDocFindFirst, update: mockDocUpdate },
  documentVersion: { create: mockVersionCreate, aggregate: mockVersionAggregate },
  jobDocumentLink: { create: mockLinkCreate },
  job: { findFirst: mockJobFindFirst },
};

const mockVersionFindFirst = vi.fn();

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
      findFirst: mockVersionFindFirst,
      findMany: mockVersionFindMany,
      aggregate: mockVersionAggregate,
    },
    job: { findFirst: mockJobFindFirst },
    jobDocumentLink: { create: mockLinkCreate, findMany: mockLinkFindMany },
  },
}));

const {
  createDocument,
  getDocumentById,
  getDocumentsByUserId,
  getDocumentsForJob,
  softDeleteDocument,
  updateDocumentContent,
  linkDocumentToJob,
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
      data: { userId: USER_ID, type: "RESUME", name: "My Resume" },
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

  it("does not link when job does not belong to user", async () => {
    mockDocCreate.mockResolvedValue(baseDoc);
    mockVersionCreate.mockResolvedValue(baseVersion);
    mockJobFindFirst.mockResolvedValue(null);

    await createDocument(USER_ID, {
      type: "RESUME",
      name: "My Resume",
      jobId: "job-other-user",
    });

    expect(mockLinkCreate).not.toHaveBeenCalled();
  });
});

describe("getDocumentsByUserId", () => {
  it("filters soft-deleted documents at the DB level", async () => {
    mockDocFindMany.mockResolvedValue([]);
    await getDocumentsByUserId(USER_ID);

    expect(mockDocFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: USER_ID, isDeleted: false },
      })
    );
  });

  it("drops documents with no versions", async () => {
    mockDocFindMany.mockResolvedValue([
      { ...baseDoc, versions: [] },
      { ...baseDoc, id: "doc-2", versions: [baseVersion] },
    ]);

    const result = await getDocumentsByUserId(USER_ID);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("doc-2");
  });
});

describe("getDocumentById", () => {
  it("scopes lookup by userId and excludes soft-deleted", async () => {
    mockDocFindFirst.mockResolvedValue(null);
    await getDocumentById("doc-1", USER_ID);

    expect(mockDocFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "doc-1", userId: USER_ID, isDeleted: false },
      })
    );
  });

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

  it("computes next version number from max() inside transaction", async () => {
    mockDocFindFirst.mockResolvedValue(baseDoc);
    mockVersionAggregate.mockResolvedValue({ _max: { versionNumber: 3 } });
    mockVersionCreate.mockResolvedValue({ ...baseVersion, versionNumber: 4 });
    mockDocUpdate.mockResolvedValue(baseDoc);

    const result = await updateDocumentContent("doc-1", USER_ID, "updated");

    expect(mockTransaction).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ isolationLevel: "Serializable" })
    );
    expect(mockVersionAggregate).toHaveBeenCalledWith({
      where: { documentId: "doc-1" },
      _max: { versionNumber: true },
    });
    expect(mockVersionCreate).toHaveBeenCalledWith({
      data: { documentId: "doc-1", versionNumber: 4, content: "updated" },
    });
    expect(result?.versionNumber).toBe(4);
  });

  it("starts at version 1 when no prior versions exist", async () => {
    mockDocFindFirst.mockResolvedValue(baseDoc);
    mockVersionAggregate.mockResolvedValue({ _max: { versionNumber: null } });
    mockVersionCreate.mockResolvedValue({ ...baseVersion, versionNumber: 1 });
    mockDocUpdate.mockResolvedValue(baseDoc);

    await updateDocumentContent("doc-1", USER_ID, "first");

    expect(mockVersionCreate).toHaveBeenCalledWith({
      data: { documentId: "doc-1", versionNumber: 1, content: "first" },
    });
  });
});

describe("linkDocumentToJob", () => {
  it("returns null when any lookup fails", async () => {
    mockJobFindFirst.mockResolvedValue(null);
    mockDocFindFirst.mockResolvedValue(baseDoc);

    const result = await linkDocumentToJob("job-1", "doc-1", "ver-1", USER_ID);
    expect(result).toBeNull();
    expect(mockLinkCreate).not.toHaveBeenCalled();
  });

  it("throws 409 ApiError on P2002 duplicate link", async () => {
    mockJobFindFirst.mockResolvedValue({ id: "job-1", userId: USER_ID });
    mockDocFindFirst.mockResolvedValue(baseDoc);
    mockVersionFindFirst.mockResolvedValue(baseVersion);
    mockLinkCreate.mockRejectedValue({ code: "P2002" });

    const { ApiError } = await import("@/lib/api-error");
    await expect(linkDocumentToJob("job-1", "doc-1", "ver-1", USER_ID)).rejects.toBeInstanceOf(
      ApiError
    );
  });
});

describe("getDocumentsForJob", () => {
  it("filters soft-deleted documents at the DB level via link query", async () => {
    mockJobFindFirst.mockResolvedValue({ id: "job-1", userId: USER_ID });
    mockLinkFindMany.mockResolvedValue([]);

    await getDocumentsForJob("job-1", USER_ID);

    expect(mockLinkFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { jobId: "job-1", document: { isDeleted: false } },
      })
    );
  });

  it("returns null when job does not belong to user", async () => {
    mockJobFindFirst.mockResolvedValue(null);
    const result = await getDocumentsForJob("job-1", USER_ID);
    expect(result).toBeNull();
  });
});
