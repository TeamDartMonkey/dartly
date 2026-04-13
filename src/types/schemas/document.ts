import { z } from "zod/v4";

export const DocumentTypeSchema = z.enum(["RESUME", "COVER_LETTER", "OTHER"]);

export const DocumentStatusSchema = z.enum(["DRAFT", "READY", "ARCHIVED"]);

export const CreateDocumentSchema = z.object({
  type: DocumentTypeSchema,
  name: z.string().trim().min(1, "Name is required").max(200),
  content: z.string().optional(),
  jobId: z.string().optional(),
});

export const UpdateDocumentContentSchema = z.object({
  content: z.string().min(1, "Content is required"),
});

export const LinkDocumentToJobSchema = z.object({
  documentId: z.string().min(1, "Document ID is required"),
  documentVersionId: z.string().min(1, "Document version ID is required"),
});
