import { Prisma, type Document, type DocumentType, type DocumentVersion } from "@prisma/client";
import { prisma } from "@/services/prisma";
import type { DocumentResponse, DocumentVersionResponse } from "@/types/document";

// Two concurrent saves on the same document can both compute the same
// nextVersion under READ COMMITTED isolation, then collide on the
// (documentId, versionNumber) unique index. Retry a small number of times
// so users do not see a generic 500 with their work lost.
const VERSION_CONFLICT_MAX_RETRIES = 3;

function isUniqueViolation(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

type CreateDocumentInput = {
  type: DocumentType;
  name: string;
  content?: string;
  jobId?: string;
};
export function toDocumentResponse(
  doc: Document,
  latestVersion: DocumentVersion
): DocumentResponse {
  return {
    id: doc.id,
    type: doc.type,
    name: doc.name,
    status: doc.status,
    content: latestVersion.content ?? undefined,
    ...(latestVersion.fileUrl ? { fileUrl: latestVersion.fileUrl } : {}),
    versionNumber: latestVersion.versionNumber,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function toVersionResponse(v: DocumentVersion): DocumentVersionResponse {
  return {
    id: v.id,
    versionNumber: v.versionNumber,
    content: v.content ?? undefined,
    createdAt: v.createdAt.toISOString(),
  };
}

function withDocumentVersionId(doc: Document, version: DocumentVersion): DocumentResponse {
  return {
    ...toDocumentResponse(doc, version),
    documentVersionId: version.id,
  };
}

export async function findDocumentByJob(userId: string, type: DocumentType, jobId: string) {
  const link = await prisma.jobDocumentLink.findFirst({
    where: { jobId, document: { userId, type, isDeleted: false } },
    include: {
      document: {
        include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
      },
    },
    orderBy: { linkedAt: "desc" },
  });

  if (!link?.document.versions.length) return null;
  return { doc: link.document, latestVersion: link.document.versions[0] };
}

export async function createDocumentForJob(userId: string, input: CreateDocumentInput) {
  const result = await createDocument(userId, input);
  return { ...result, isNew: true };
}

// Sentinel thrown when a jobId is supplied but does not belong to the user.
// The transaction will roll back so the document is not created at all.
export class JobOwnershipError extends Error {
  constructor() {
    super("Job not owned by user");
    this.name = "JobOwnershipError";
  }
}

export async function createDocument(userId: string, input: CreateDocumentInput) {
  return prisma.$transaction(async (tx) => {
    // Verify ownership BEFORE creating the doc so the transaction rolls
    // back cleanly if the job does not belong to the user.
    if (input.jobId) {
      const job = await tx.job.findFirst({
        where: { id: input.jobId, userId },
        select: { id: true },
      });
      if (!job) throw new JobOwnershipError();
    }

    const doc = await tx.document.create({
      data: {
        userId,
        type: input.type,
        name: input.name,
        status: "DRAFT",
      },
    });

    const version = await tx.documentVersion.create({
      data: {
        documentId: doc.id,
        versionNumber: 1,
        content: input.content ?? null,
      },
    });

    if (input.jobId) {
      await tx.jobDocumentLink.create({
        data: {
          jobId: input.jobId,
          documentId: doc.id,
          documentVersionId: version.id,
        },
      });
    }

    return { doc, version, linked: !!input.jobId };
  });
}

export async function duplicateDocument(id: string, userId: string) {
  const doc = await prisma.document.findFirst({
    where: { id, userId, isDeleted: false },
    include: {
      versions: { orderBy: { versionNumber: "desc" }, take: 1 },
    },
  });

  if (!doc || doc.versions.length === 0) return null;
  const sourceVersion = doc.versions[0];

  return prisma.$transaction(async (tx) => {
    const newDoc = await tx.document.create({
      data: {
        userId,
        type: doc.type,
        name: `Copy of ${doc.name}`,
        status: doc.status,
      },
    });

    const newVersion = await tx.documentVersion.create({
      data: {
        documentId: newDoc.id,
        versionNumber: 1,
        content: sourceVersion.content ?? null,
        fileUrl: sourceVersion.fileUrl ?? null,
      },
    });

    return withDocumentVersionId(newDoc, newVersion);
  });
}

// Renames using updateMany so the userId scoping is enforced in the WHERE
// clause itself — no read-then-write window where ownership could change.
export async function renameDocument(id: string, userId: string, name: string) {
  const { count } = await prisma.document.updateMany({
    where: { id, userId, isDeleted: false },
    data: { name, updatedAt: new Date() },
  });
  if (count === 0) return null;

  const doc = await prisma.document.findFirst({
    where: { id, userId, isDeleted: false },
    include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
  });
  if (!doc || doc.versions.length === 0) return null;
  return withDocumentVersionId(doc, doc.versions[0]);
}

export async function getDocumentsByUserId(userId: string) {
  const docs = await prisma.document.findMany({
    where: { userId, isDeleted: false },
    include: {
      versions: { orderBy: { versionNumber: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  return docs
    .filter((d) => d.versions.length > 0)
    .map((d) => withDocumentVersionId(d, d.versions[0]));
}

export async function getDocumentById(id: string, userId: string) {
  const doc = await prisma.document.findFirst({
    where: { id, userId, isDeleted: false },
    include: {
      versions: { orderBy: { versionNumber: "desc" }, take: 1 },
    },
  });

  if (!doc || doc.versions.length === 0) return null;
  return withDocumentVersionId(doc, doc.versions[0]);
}

// Computes the next version number INSIDE the transaction so two concurrent
// saves cannot both compute the same value and produce duplicate versions.
// On READ COMMITTED, two transactions can still see the same baseline; the
// (documentId, versionNumber) unique index causes one to fail with P2002,
// which we retry a small number of times.
export async function updateDocumentContent(id: string, userId: string, content: string) {
  for (let attempt = 0; attempt < VERSION_CONFLICT_MAX_RETRIES; attempt++) {
    try {
      return await prisma.$transaction(async (tx) => {
        const doc = await tx.document.findFirst({
          where: { id, userId, isDeleted: false },
          include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
        });
        if (!doc) return null;

        const nextVersion = doc.versions.length > 0 ? doc.versions[0].versionNumber + 1 : 1;

        const version = await tx.documentVersion.create({
          data: { documentId: id, versionNumber: nextVersion, content },
        });

        const updated = await tx.document.update({
          where: { id },
          data: { updatedAt: new Date() },
        });

        return withDocumentVersionId(updated, version);
      });
    } catch (err) {
      if (!isUniqueViolation(err) || attempt === VERSION_CONFLICT_MAX_RETRIES - 1) throw err;
      // Tiny backoff before retry to let the conflicting transaction commit.
      await new Promise((resolve) => setTimeout(resolve, 25 * (attempt + 1)));
    }
  }
  return null;
}

export async function softDeleteDocument(id: string, userId: string): Promise<boolean> {
  const { count } = await prisma.document.updateMany({
    where: { id, userId, isDeleted: false },
    data: { isDeleted: true, deletedAt: new Date() },
  });
  return count > 0;
}

export async function getDocumentVersions(documentId: string, userId: string) {
  const doc = await prisma.document.findFirst({
    where: { id: documentId, userId, isDeleted: false },
  });
  if (!doc) return null;

  const versions = await prisma.documentVersion.findMany({
    where: { documentId },
    orderBy: { versionNumber: "desc" },
  });
  return versions.map(toVersionResponse);
}

// Same race-fix as updateDocumentContent: compute nextVersion inside the txn,
// retry on P2002 unique-constraint conflicts caused by concurrent saves.
export async function createDocumentVersion(documentId: string, userId: string, content: string) {
  for (let attempt = 0; attempt < VERSION_CONFLICT_MAX_RETRIES; attempt++) {
    try {
      return await prisma.$transaction(async (tx) => {
        const doc = await tx.document.findFirst({
          where: { id: documentId, userId, isDeleted: false },
          include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
        });
        if (!doc) return null;

        const nextVersion = doc.versions.length > 0 ? doc.versions[0].versionNumber + 1 : 1;

        const version = await tx.documentVersion.create({
          data: { documentId, versionNumber: nextVersion, content },
        });

        return toVersionResponse(version);
      });
    } catch (err) {
      if (!isUniqueViolation(err) || attempt === VERSION_CONFLICT_MAX_RETRIES - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, 25 * (attempt + 1)));
    }
  }
  return null;
}

export async function linkDocumentToJob(
  jobId: string,
  documentId: string,
  documentVersionId: string,
  userId: string
) {
  const [job, doc, version] = await Promise.all([
    prisma.job.findFirst({ where: { id: jobId, userId } }),
    prisma.document.findFirst({ where: { id: documentId, userId, isDeleted: false } }),
    prisma.documentVersion.findFirst({ where: { id: documentVersionId, documentId } }),
  ]);

  if (!job || !doc || !version) return null;

  return prisma.jobDocumentLink.upsert({
    where: { jobId_documentVersionId: { jobId, documentVersionId } },
    create: { jobId, documentId, documentVersionId },
    update: {},
  });
}

export async function getDocumentsForJob(jobId: string, userId: string) {
  const job = await prisma.job.findFirst({ where: { id: jobId, userId } });
  if (!job) return null;

  // Filter at the SQL layer to avoid pulling soft-deleted or empty documents.
  const links = await prisma.jobDocumentLink.findMany({
    where: { jobId, document: { isDeleted: false, versions: { some: {} } } },
    include: {
      document: {
        include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
      },
    },
    orderBy: { linkedAt: "desc" },
  });

  return links
    .filter((l) => l.document.versions.length > 0)
    .map((l) => ({
      ...toDocumentResponse(l.document, l.document.versions[0]),
      documentVersionId: l.documentVersionId,
      linkedAt: l.linkedAt.toISOString(),
    }));
}

export async function archiveDocument(id: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const doc = await tx.document.findFirst({
      where: { id, userId, isDeleted: false },
      include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
    });
    if (!doc || doc.versions.length === 0) return null;

    const { count } = await tx.document.updateMany({
      where: { id, userId, isDeleted: false },
      data: { previousStatus: doc.status, status: "ARCHIVED", updatedAt: new Date() },
    });
    if (count === 0) return null;

    const updated = await tx.document.findFirstOrThrow({ where: { id } });
    return withDocumentVersionId(updated, doc.versions[0]);
  });
}

export async function restoreDocument(id: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const doc = await tx.document.findFirst({
      where: { id, userId, isDeleted: false },
      include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
    });
    if (!doc || doc.versions.length === 0) return null;

    const restoredStatus = doc.previousStatus ?? (doc.versions[0].fileUrl ? "UPLOADED" : "DRAFT");

    const { count } = await tx.document.updateMany({
      where: { id, userId, isDeleted: false },
      data: { status: restoredStatus, previousStatus: null, updatedAt: new Date() },
    });
    if (count === 0) return null;

    const updated = await tx.document.findFirstOrThrow({ where: { id } });
    return withDocumentVersionId(updated, doc.versions[0]);
  });
}
