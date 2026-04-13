import { type NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { withHttpLogging } from "@/lib/api-wrapper";
import logger from "@/lib/logger";
import { requireAuth } from "@/lib/requireAuth";
import { validateBody } from "@/lib/validate-body";
import { createDocument, getDocumentsByUserId, toDocumentResponse } from "@/services/documents";
import { CreateDocumentSchema } from "@/types/schemas";

export async function GET(request: NextRequest) {
  return withHttpLogging(request, async () => {
    try {
      const user = await requireAuth();
      const docs = await getDocumentsByUserId(user.id);
      return NextResponse.json(docs, { status: 200 });
    } catch (err) {
      return handleApiError(err);
    }
  });
}

export async function POST(request: NextRequest) {
  return withHttpLogging(request, async () => {
    try {
      const user = await requireAuth();
      const data = await validateBody(request, CreateDocumentSchema);

      const { doc, version } = await createDocument(user.id, data);

      logger.info("Document created", {
        userId: user.id,
        documentId: doc.id,
        type: data.type,
      });

      return NextResponse.json(toDocumentResponse(doc, version), { status: 201 });
    } catch (err) {
      return handleApiError(err);
    }
  });
}
