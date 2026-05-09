import { beforeEach, describe, expect, it, vi } from "vitest";

const mockTransaction = vi.fn();
const mockDocCreate = vi.fn();
const mockDocFindFirst = vi.fn();
const mockDocFindFirstOrThrow = vi.fn();
const mockDocFindMany = vi.fn();
const mockDocUpdate = vi.fn();
const mockDocUpdateMany = vi.fn();
const mockVersionCreate = vi.fn();
const mockVersionFindFirst = vi.fn();
const mockVersionFindMany = vi.fn();
const mockJobFindFirst = vi.fn();
const mockLinkCreate = vi.fn();
const mockLinkUpsert = vi.fn();
const mockLinkFindFirst = vi.fn();
const mockLinkFindMany = vi.fn();

// The transaction mock forwards a `tx` object that mirrors the top-level
// prisma mock — both use the same underlying jest fns so test assertions
// don't need to know whether a call ran inside or outside a transaction.
const tx = {
  document: {
    create: mockDocCreate,
    update: mockDocUpdate,
    updateMany: mockDocUpdateMany,
    findFirst: mockDocFindFirst,
    findFirstOrThrow: mockDocFindFirstOrThrow,
  },
  documentVersion: { create: mockVersionCreate },
  jobDocumentLink: { create: mockLinkCreate },
  job: { findFirst: mockJobFindFirst },
};

vi.mock("@/services/prisma", () => ({
  prisma: {
    $transaction: mockTransaction,
    document: {
      findFirst: mockDocFindFirst,
      findFirstOrThrow: mockDocFindFirstOrThrow,
      findMany: mockDocFindMany,
      update: mockDocUpdate,
      updateMany: mockDocUpdateMany,
    },
    documentVersion: {
      create: mockVersionCreate,
      findFirst: mockVersionFindFirst,
      findMany: mockVersionFindMany,
    },
    job: { findFirst: mockJobFindFirst },
    jobDocumentLink: {
      create: mockLinkCreate,
      upsert: mockLinkUpsert,
      findFirst: mockLinkFindFirst,
      findMany: mockLinkFindMany,
    },
  },
}));

const {
  createDocument,
  createDocumentVersion,
  findDocumentByJob,
  getDocumentById,
  getDocumentVersions,
  getDocumentsByUserId,
  getDocumentsForJob,
  linkDocumentToJob,
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
  previousStatus: null,
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
  it("returns true after soft-deleting (scoped by userId in updateMany)", async () => {
    mockDocUpdateMany.mockResolvedValue({ count: 1 });

    const result = await softDeleteDocument("doc-1", USER_ID);
    expect(result).toBe(true);
    expect(mockDocUpdateMany).toHaveBeenCalledWith({
      where: { id: "doc-1", userId: USER_ID, isDeleted: false },
      data: { isDeleted: true, deletedAt: expect.any(Date) },
    });
  });

  it("returns false when document not found", async () => {
    mockDocUpdateMany.mockResolvedValue({ count: 0 });
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

describe("linkDocumentToJob", () => {
  const baseLink = {
    id: "link-1",
    jobId: "job-1",
    documentId: "doc-1",
    documentVersionId: "ver-1",
    linkedAt: now,
  };

  it("upserts idempotently so a duplicate link does not fail", async () => {
    mockJobFindFirst.mockResolvedValue({ id: "job-1", userId: USER_ID });
    mockDocFindFirst.mockResolvedValue(baseDoc);
    mockVersionFindFirst.mockResolvedValue(baseVersion);
    mockLinkUpsert.mockResolvedValue(baseLink);

    const first = await linkDocumentToJob("job-1", "doc-1", "ver-1", USER_ID);
    const second = await linkDocumentToJob("job-1", "doc-1", "ver-1", USER_ID);

    expect(first).toEqual(baseLink);
    expect(second).toEqual(baseLink);
    expect(mockLinkUpsert).toHaveBeenCalledTimes(2);
    expect(mockLinkUpsert).toHaveBeenCalledWith({
      where: { jobId_documentVersionId: { jobId: "job-1", documentVersionId: "ver-1" } },
      create: { jobId: "job-1", documentId: "doc-1", documentVersionId: "ver-1" },
      update: {},
    });
  });

  it("returns null when the job does not belong to the user", async () => {
    mockJobFindFirst.mockResolvedValue(null);
    mockDocFindFirst.mockResolvedValue(baseDoc);
    mockVersionFindFirst.mockResolvedValue(baseVersion);

    const result = await linkDocumentToJob("job-1", "doc-1", "ver-1", USER_ID);

    expect(result).toBeNull();
    expect(mockLinkUpsert).not.toHaveBeenCalled();
  });
});

describe("cross-user access guards", () => {
  const OTHER_USER = "user-2";

  it("getDocumentById scopes lookup by userId (wrong user → null)", async () => {
    mockDocFindFirst.mockResolvedValue(null);

    const result = await getDocumentById("doc-1", OTHER_USER);

    expect(result).toBeNull();
    expect(mockDocFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: "doc-1", userId: OTHER_USER }),
      })
    );
  });

  it("updateDocumentContent scopes lookup by userId and does not write on wrong user", async () => {
    mockDocFindFirst.mockResolvedValue(null);

    const result = await updateDocumentContent("doc-1", OTHER_USER, "tampered");

    expect(result).toBeNull();
    expect(mockVersionCreate).not.toHaveBeenCalled();
    expect(mockDocFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: "doc-1", userId: OTHER_USER }),
      })
    );
  });

  it("softDeleteDocument scopes lookup by userId (wrong user → false, no update)", async () => {
    mockDocUpdateMany.mockResolvedValue({ count: 0 });

    const result = await softDeleteDocument("doc-1", OTHER_USER);

    expect(result).toBe(false);
    expect(mockDocUpdateMany).toHaveBeenCalledWith({
      where: { id: "doc-1", userId: OTHER_USER, isDeleted: false },
      data: expect.any(Object),
    });
  });

  it("findDocumentByJob scopes the nested document relation by userId", async () => {
    mockLinkFindFirst.mockResolvedValue(null);

    const result = await findDocumentByJob(OTHER_USER, "RESUME", "job-1");

    expect(result).toBeNull();
    expect(mockLinkFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          jobId: "job-1",
          document: expect.objectContaining({ userId: OTHER_USER }),
        }),
      })
    );
  });
});

describe("updateDocumentContent (versioning)", () => {
  it("increments versionNumber by 1 over the latest existing version", async () => {
    const v3 = { ...baseVersion, id: "ver-3", versionNumber: 3 };
    mockDocFindFirst.mockResolvedValue({ ...baseDoc, versions: [v3] });
    mockVersionCreate.mockResolvedValue({
      ...baseVersion,
      id: "ver-4",
      versionNumber: 4,
      content: "v4",
    });
    mockDocUpdate.mockResolvedValue(baseDoc);

    const result = await updateDocumentContent("doc-1", USER_ID, "v4");

    expect(mockVersionCreate).toHaveBeenCalledWith({
      data: { documentId: "doc-1", versionNumber: 4, content: "v4" },
    });
    expect(result?.versionNumber).toBe(4);
  });

  it("starts at versionNumber 1 when no versions exist (defensive)", async () => {
    mockDocFindFirst.mockResolvedValue({ ...baseDoc, versions: [] });
    mockVersionCreate.mockResolvedValue({ ...baseVersion, content: "first" });
    mockDocUpdate.mockResolvedValue(baseDoc);

    await updateDocumentContent("doc-1", USER_ID, "first");

    expect(mockVersionCreate).toHaveBeenCalledWith({
      data: { documentId: "doc-1", versionNumber: 1, content: "first" },
    });
  });

  it("filters out soft-deleted documents (isDeleted: false in where clause)", async () => {
    mockDocFindFirst.mockResolvedValue(null);

    await updateDocumentContent("doc-1", USER_ID, "x");

    expect(mockDocFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isDeleted: false }),
      })
    );
  });
});

describe("createDocumentVersion", () => {
  const newVersion = { ...baseVersion, id: "ver-2", versionNumber: 2, content: "v2" };

  it("creates the next version when document is owned by user", async () => {
    mockDocFindFirst.mockResolvedValue({ ...baseDoc, versions: [baseVersion] });
    mockVersionCreate.mockResolvedValue(newVersion);

    const result = await createDocumentVersion("doc-1", USER_ID, "v2");

    expect(result).toEqual({
      id: "ver-2",
      versionNumber: 2,
      content: "v2",
      createdAt: now.toISOString(),
    });
    expect(mockVersionCreate).toHaveBeenCalledWith({
      data: { documentId: "doc-1", versionNumber: 2, content: "v2" },
    });
  });

  it("returns null when document does not belong to user (no version created)", async () => {
    mockDocFindFirst.mockResolvedValue(null);

    const result = await createDocumentVersion("doc-1", "user-2", "tampered");

    expect(result).toBeNull();
    expect(mockVersionCreate).not.toHaveBeenCalled();
  });

  it("ignores soft-deleted documents", async () => {
    mockDocFindFirst.mockResolvedValue(null);

    await createDocumentVersion("doc-1", USER_ID, "x");

    expect(mockDocFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isDeleted: false }),
      })
    );
  });
});

describe("getDocumentVersions", () => {
  it("returns versions newest-first, mapped to DocumentVersionResponse", async () => {
    mockDocFindFirst.mockResolvedValue(baseDoc);
    mockVersionFindMany.mockResolvedValue([
      { ...baseVersion, id: "ver-2", versionNumber: 2, content: "v2" },
      { ...baseVersion, id: "ver-1", versionNumber: 1, content: "v1" },
    ]);

    const result = await getDocumentVersions("doc-1", USER_ID);

    expect(result).toEqual([
      { id: "ver-2", versionNumber: 2, content: "v2", createdAt: now.toISOString() },
      { id: "ver-1", versionNumber: 1, content: "v1", createdAt: now.toISOString() },
    ]);
    expect(mockVersionFindMany).toHaveBeenCalledWith({
      where: { documentId: "doc-1" },
      orderBy: { versionNumber: "desc" },
    });
  });

  it("returns null and does not fetch versions when document is not owned", async () => {
    mockDocFindFirst.mockResolvedValue(null);

    const result = await getDocumentVersions("doc-1", "user-2");

    expect(result).toBeNull();
    expect(mockVersionFindMany).not.toHaveBeenCalled();
  });
});

describe("getDocumentsByUserId", () => {
  it("filters out documents with no versions", async () => {
    const docWithVersion = { ...baseDoc, id: "doc-a", versions: [baseVersion] };
    const docWithoutVersion = { ...baseDoc, id: "doc-b", versions: [] };
    mockDocFindMany.mockResolvedValue([docWithVersion, docWithoutVersion]);

    const result = await getDocumentsByUserId(USER_ID);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("doc-a");
  });

  it("scopes by userId and excludes soft-deleted docs", async () => {
    mockDocFindMany.mockResolvedValue([]);

    await getDocumentsByUserId(USER_ID);

    expect(mockDocFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: USER_ID, isDeleted: false },
      })
    );
  });
});

describe("getDocumentsForJob", () => {
  const job = { id: "job-1", userId: USER_ID };

  it("returns null when the job does not belong to the user", async () => {
    mockJobFindFirst.mockResolvedValue(null);

    const result = await getDocumentsForJob("job-1", "user-2");

    expect(result).toBeNull();
    expect(mockLinkFindMany).not.toHaveBeenCalled();
  });

  it("filters soft-deleted documents at the SQL layer", async () => {
    mockJobFindFirst.mockResolvedValue(job);
    mockLinkFindMany.mockResolvedValue([
      {
        id: "link-1",
        jobId: "job-1",
        documentId: "doc-1",
        documentVersionId: "ver-1",
        linkedAt: now,
        document: { ...baseDoc, isDeleted: false, versions: [baseVersion] },
      },
    ]);

    const result = await getDocumentsForJob("job-1", USER_ID);

    expect(result).toHaveLength(1);
    expect(result?.[0].id).toBe("doc-1");
    expect(result?.[0].linkedAt).toBe(now.toISOString());
    // Verify the WHERE clause filters at the database
    expect(mockLinkFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          document: expect.objectContaining({ isDeleted: false }),
        }),
      })
    );
  });

  it("filters out documents with no versions", async () => {
    mockJobFindFirst.mockResolvedValue(job);
    mockLinkFindMany.mockResolvedValue([
      {
        id: "link-1",
        jobId: "job-1",
        documentId: "doc-1",
        documentVersionId: "ver-1",
        linkedAt: now,
        document: { ...baseDoc, versions: [] },
      },
    ]);

    const result = await getDocumentsForJob("job-1", USER_ID);

    expect(result).toEqual([]);
  });
});

describe("findDocumentByJob (happy path)", () => {
  it("returns the latest version of the linked document", async () => {
    mockLinkFindFirst.mockResolvedValue({
      id: "link-1",
      jobId: "job-1",
      documentId: "doc-1",
      documentVersionId: "ver-2",
      linkedAt: now,
      document: {
        ...baseDoc,
        versions: [{ ...baseVersion, id: "ver-2", versionNumber: 2, content: "v2" }],
      },
    });

    const result = await findDocumentByJob(USER_ID, "RESUME", "job-1");

    expect(result?.doc.id).toBe("doc-1");
    expect(result?.latestVersion.versionNumber).toBe(2);
  });

  it("returns null when the link exists but the document has no versions", async () => {
    mockLinkFindFirst.mockResolvedValue({
      id: "link-1",
      jobId: "job-1",
      documentId: "doc-1",
      documentVersionId: "ver-1",
      linkedAt: now,
      document: { ...baseDoc, versions: [] },
    });

    const result = await findDocumentByJob(USER_ID, "RESUME", "job-1");

    expect(result).toBeNull();
  });
});

describe("linkDocumentToJob (cross-user ownership)", () => {
  it("returns null when the document does not belong to the user", async () => {
    mockJobFindFirst.mockResolvedValue({ id: "job-1", userId: USER_ID });
    mockDocFindFirst.mockResolvedValue(null);
    mockVersionFindFirst.mockResolvedValue(baseVersion);

    const result = await linkDocumentToJob("job-1", "doc-1", "ver-1", USER_ID);

    expect(result).toBeNull();
    expect(mockLinkUpsert).not.toHaveBeenCalled();
  });

  it("returns null when the version does not belong to the document", async () => {
    mockJobFindFirst.mockResolvedValue({ id: "job-1", userId: USER_ID });
    mockDocFindFirst.mockResolvedValue(baseDoc);
    mockVersionFindFirst.mockResolvedValue(null);

    const result = await linkDocumentToJob("job-1", "doc-1", "ver-99", USER_ID);

    expect(result).toBeNull();
    expect(mockLinkUpsert).not.toHaveBeenCalled();
  });

  it("scopes the version lookup to the documentId so cross-doc versions cannot link", async () => {
    mockJobFindFirst.mockResolvedValue({ id: "job-1", userId: USER_ID });
    mockDocFindFirst.mockResolvedValue(baseDoc);
    mockVersionFindFirst.mockResolvedValue(null);

    await linkDocumentToJob("job-1", "doc-1", "ver-from-other-doc", USER_ID);

    expect(mockVersionFindFirst).toHaveBeenCalledWith({
      where: { id: "ver-from-other-doc", documentId: "doc-1" },
    });
  });
});
