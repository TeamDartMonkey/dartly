import { z } from "zod/v4";

export const DocumentTypeSchema = z.enum(["RESUME", "COVER_LETTER", "OTHER"]);

export const DocumentStatusSchema = z.enum(["DRAFT", "READY", "ARCHIVED", "UPLOADED"]);

const MAX_CONTENT_LEN = 200_000;

export const CreateDocumentSchema = z.object({
  type: DocumentTypeSchema,
  name: z.string().trim().min(1, "Name is required").max(200),
  content: z.string().max(MAX_CONTENT_LEN).optional(),
  jobId: z.string().min(1).optional(),
});

export const UpdateDocumentContentSchema = z.object({
  content: z.string().min(1, "Content is required").max(MAX_CONTENT_LEN),
});

export const LinkDocumentToJobSchema = z.object({
  documentId: z.string().min(1, "Document ID is required"),
  documentVersionId: z.string().min(1, "Document version ID is required"),
});

export const GenerateDocumentSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
});

export const RewriteContentSchema = z.object({
  documentId: z.string().min(1, "Document ID is required"),
  instruction: z.string().trim().min(1, "Instruction is required").max(500),
});

export const RenameDocumentSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
});
