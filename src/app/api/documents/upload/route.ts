import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { ApiError, handleApiError } from "@/lib/api-error";
import { withHttpLogging } from "@/lib/api-wrapper";
import { env } from "@/lib/env";
import logger from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/requireAuth";
import { createClient } from "@/lib/supabase-server";
import { prisma } from "@/services/prisma";
import { DocumentTypeSchema } from "@/types/schemas/document";

// Zod schema for the multipart text fields. The file itself is validated
// separately because validateBody only handles JSON.
const UploadFieldsSchema = z.object({
  type: DocumentTypeSchema,
  name: z.string().trim().min(1, "Document name is required").max(200),
});

const ALLOWED_MIME_TYPES = new Set(["application/pdf"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MiB
// 100 bytes is well below any real PDF (the smallest valid PDFs are ~300B);
// rejecting tiny files prevents a user from creating a Document that is
// pure header bytes with no actual content.
const MIN_FILE_SIZE = 100;
const PDF_MAGIC = new TextEncoder().encode("%PDF-");

function startsWithPdfMagic(buf: Uint8Array): boolean {
  if (buf.length < PDF_MAGIC.length) return false;
  for (let i = 0; i < PDF_MAGIC.length; i++) {
    if (buf[i] !== PDF_MAGIC[i]) return false;
  }
  return true;
}

function isValidExt(ext: string | undefined): ext is string {
  return typeof ext === "string" && /^[a-z0-9]{1,8}$/i.test(ext);
}

export async function POST(request: NextRequest) {
  return withHttpLogging(request, async () => {
    const limited = await checkRateLimit(request, {
      id: "api/documents/upload",
      limit: 10,
      windowSecs: 60,
    });
    if (limited) return limited;

    try {
      const user = await requireAuth();

      const formData = await request.formData();
      const fileEntry = formData.get("file");

      if (!(fileEntry instanceof File)) {
        return NextResponse.json({ error: "File is required" }, { status: 400 });
      }
      const file = fileEntry;

      // Validate text fields with Zod so length and shape are enforced
      // identically to the JSON-bodied document creation path.
      const fieldsResult = UploadFieldsSchema.safeParse({
        type: formData.get("type"),
        name: formData.get("name"),
      });
      if (!fieldsResult.success) {
        return NextResponse.json(
          { error: z.prettifyError(fieldsResult.error) },
          { status: 400 }
        );
      }
      const { type, name } = fieldsResult.data;

      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "File size must be under 10MB" }, { status: 400 });
      }
      if (file.size < MIN_FILE_SIZE) {
        return NextResponse.json({ error: "File is too small to be a valid PDF" }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Server-side magic-byte sniff — client-supplied content-type is not trusted.
      // PDFs always start with "%PDF-".
      if (!startsWithPdfMagic(bytes)) {
        return NextResponse.json({ error: "Uploaded file is not a valid PDF" }, { status: 400 });
      }

      // Sanitize the extension via a strict allowlist regex; we hardcode "pdf"
      // here but the validation guards against future changes that might
      // pass file.name through.
      const rawExt = file.name.split(".").pop()?.toLowerCase();
      const fileExt = isValidExt(rawExt) ? rawExt : "pdf";
      const storagePath = `${user.id}/${Date.now()}.${fileExt}`;

      const supabase = await createClient();
      const { error: storageError } = await supabase.storage
        .from(env.SUPABASE_DOCUMENTS_BUCKET)
        .upload(storagePath, bytes, {
          contentType: file.type,
          upsert: false,
        });

      if (storageError) {
        logger.error("Supabase storage upload failed", { error: storageError.message });
        throw new ApiError(500, "File upload failed");
      }

      // Wrap the Prisma writes in a single transaction so a failure cannot
      // leave a half-created Document; on transaction failure we delete the
      // storage object to keep the bucket clean. Only the transaction await
      // is inside the rollback-guarding try; later serialization runs after
      // the commit so a JSON serialization error does not delete a real
      // storage object.
      let result: { doc: Awaited<ReturnType<typeof prisma.document.create>>; version: Awaited<ReturnType<typeof prisma.documentVersion.create>> };
      try {
        result = await prisma.$transaction(async (tx) => {
          const doc = await tx.document.create({
            data: { userId: user.id, type, name, status: "UPLOADED" },
          });
          const version = await tx.documentVersion.create({
            data: {
              documentId: doc.id,
              versionNumber: 1,
              content: null,
              fileUrl: storagePath,
            },
          });
          return { doc, version };
        });
      } catch (dbError) {
        // Best-effort rollback of the storage upload so the bucket stays
        // clean. Log if the rollback itself fails so an orphan can be
        // diagnosed instead of silently lingering in the bucket.
        await supabase.storage
          .from(env.SUPABASE_DOCUMENTS_BUCKET)
          .remove([storagePath])
          .catch((removeErr) => {
            logger.error("Failed to remove storage object after DB rollback", {
              storagePath,
              message: removeErr instanceof Error ? removeErr.message : String(removeErr),
            });
          });
        logger.error("Document upload DB write failed; storage object removed", {
          userId: user.id,
          storagePath,
          message: dbError instanceof Error ? dbError.message : String(dbError),
        });
        throw new ApiError(500, "Document upload failed");
      }

      logger.info("Document uploaded", {
        userId: user.id,
        documentId: result.doc.id,
        type,
        storagePath,
      });

      return NextResponse.json(
        {
          id: result.doc.id,
          type: result.doc.type,
          name: result.doc.name,
          status: result.doc.status,
          versionNumber: result.version.versionNumber,
          fileUrl: storagePath,
          createdAt: result.doc.createdAt.toISOString(),
          updatedAt: result.doc.updatedAt.toISOString(),
        },
        { status: 201 }
      );
    } catch (err) {
      return handleApiError(err);
    }
  });
}
