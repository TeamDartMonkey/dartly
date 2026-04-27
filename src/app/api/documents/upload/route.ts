import { type NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { withHttpLogging } from "@/lib/api-wrapper";
import { env } from "@/lib/env";
import logger from "@/lib/logger";
import { requireAuth } from "@/lib/requireAuth";
import { createClient } from "@/lib/supabase-server";
import { createDocument } from "@/services/documents";
import { prisma } from "@/services/prisma";
import type { DocumentType } from "@/types/document";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; //10MB

export async function POST(request: NextRequest) {
  return withHttpLogging(request, async () => {
    try {
      const user = await requireAuth();

      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const type = formData.get("type") as DocumentType | null;
      const name = formData.get("name") as string | null;

      if (!file) {
        return NextResponse.json({ error: "File is required" }, { status: 400 });
      }
      if (!type || !["RESUME", "COVER_LETTER", "OTHER"].includes(type)) {
        return NextResponse.json({ error: "Valid document type is required" }, { status: 400 });
      }
      if (!name || name.trim().length === 0) {
        return NextResponse.json({ error: "Document name is required" }, { status: 400 });
      }
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: "Only PDF and DOCX files are supported" },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "File size must be under 10MB" },
          { status: 400 }
        );
      }

      //uploads to supabase storage
      const supabase = await createClient();
      const fileExt = file.name.split(".").pop();
      const storagePath = `${user.id}/${Date.now()}.${fileExt}`;

      const arrayBuffer = await file.arrayBuffer();
      const { error: storageError } = await supabase.storage
        .from(env.SUPABASE_DOCUMENTS_BUCKET)
        .upload(storagePath, arrayBuffer, {
          contentType: file.type,
          upsert: false,
        });

      if (storageError) {
        logger.error("Supabase storage upload failed", { error: storageError.message });
        return NextResponse.json({ error: "File upload failed" }, { status: 500 });
      }

      const { doc, version } = await createDocument(user.id, {
        type,
        name: name.trim(),
      });

      await prisma.documentVersion.update({
        where: { id: version.id },
        data: { fileUrl: storagePath },
      });

      await prisma.document.update({
        where: { id: doc.id },
        data: { status: "UPLOADED" },
      });

      logger.info("Document uploaded", {
        userId: user.id,
        documentId: doc.id,
        type,
        storagePath,
      });

      return NextResponse.json(
        {
          id: doc.id,
          type: doc.type,
          name: doc.name,
          status: "UPLOADED" as const,
          versionNumber: version.versionNumber,
          fileUrl: storagePath,
          createdAt: doc.createdAt.toISOString(),
          updatedAt: doc.updatedAt.toISOString(),
        },
        { status: 201 }
      );
    } catch (err) {
      return handleApiError(err);
    }
  });
}