import type { Document, DocumentType, DocumentVersion } from "@prisma/client";
import { prisma } from "@/services/prisma";
import type { DocumentResponse, DocumentVersionResponse } from "@/types/document";

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

export async function createDocument(userId: string, input: CreateDocumentInput) {
  return prisma.$transaction(async (tx) => {
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
      const job = await tx.job.findFirst({ where: { id: input.jobId, userId } });
      if (job) {
        await tx.jobDocumentLink.create({
          data: {
            jobId: input.jobId,
            documentId: doc.id,
            documentVersionId: version.id,
          },
        });
      }
    }

    return { doc, version };
  });
}

export async function getDocumentsByUserId(userId: string) {
  const docs = await prisma.document.findMany({
    where: { userId, isDeleted: false },
    include: {
      versions: { orderBy: { versionNumber: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  return docs.filter((d) => d.versions.length > 0).map((d) => toDocumentResponse(d, d.versions[0]));
}

export async function getDocumentById(id: string, userId: string) {
  const doc = await prisma.document.findFirst({
    where: { id, userId, isDeleted: false },
    include: {
      versions: { orderBy: { versionNumber: "desc" }, take: 1 },
    },
  });

  if (!doc || doc.versions.length === 0) return null;
  return toDocumentResponse(doc, doc.versions[0]);
}

export async function updateDocumentContent(id: string, userId: string, content: string) {
  const doc = await prisma.document.findFirst({
    where: { id, userId, isDeleted: false },
    include: {
      versions: { orderBy: { versionNumber: "desc" }, take: 1 },
    },
  });

  if (!doc) return null;

  const nextVersion = doc.versions.length > 0 ? doc.versions[0].versionNumber + 1 : 1;

  return prisma.$transaction(async (tx) => {
    const version = await tx.documentVersion.create({
      data: {
        documentId: id,
        versionNumber: nextVersion,
        content,
      },
    });

    const updated = await tx.document.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return toDocumentResponse(updated, version);
  });
}

export async function softDeleteDocument(id: string, userId: string): Promise<boolean> {
  const doc = await prisma.document.findFirst({
    where: { id, userId, isDeleted: false },
  });
  if (!doc) return false;

  await prisma.document.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
  return true;
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

export async function createDocumentVersion(documentId: string, userId: string, content: string) {
  const doc = await prisma.document.findFirst({
    where: { id: documentId, userId, isDeleted: false },
    include: {
      versions: { orderBy: { versionNumber: "desc" }, take: 1 },
    },
  });

  if (!doc) return null;

  const nextVersion = doc.versions.length > 0 ? doc.versions[0].versionNumber + 1 : 1;

  const version = await prisma.documentVersion.create({
    data: {
      documentId,
      versionNumber: nextVersion,
      content,
    },
  });

  return toVersionResponse(version);
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

  return prisma.jobDocumentLink.create({
    data: { jobId, documentId, documentVersionId },
  });
}

export async function getDocumentsForJob(jobId: string, userId: string) {
  const job = await prisma.job.findFirst({ where: { id: jobId, userId } });
  if (!job) return null;

  const links = await prisma.jobDocumentLink.findMany({
    where: { jobId },
    include: {
      document: true,
      documentVersion: true,
    },
    orderBy: { linkedAt: "desc" },
  });

  return links
    .filter((l) => !l.document.isDeleted)
    .map((l) => ({
      ...toDocumentResponse(l.document, l.documentVersion),
      linkedAt: l.linkedAt.toISOString(),
    }));
}
