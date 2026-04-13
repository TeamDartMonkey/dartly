import { type NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { withHttpLogging } from "@/lib/api-wrapper";
import logger from "@/lib/logger";
import { requireAuth } from "@/lib/requireAuth";
import { validateBody } from "@/lib/validate-body";
import { getDocumentById, softDeleteDocument, updateDocumentContent } from "@/services/documents";
import { UpdateDocumentContentSchema } from "@/types/schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  return withHttpLogging(request, async () => {
    try {
      const user = await requireAuth();
      const { id } = await context.params;

      const doc = await getDocumentById(id, user.id);
      if (!doc) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
      }

      return NextResponse.json(doc, { status: 200 });
    } catch (err) {
      return handleApiError(err);
    }
  });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return withHttpLogging(request, async () => {
    try {
      const user = await requireAuth();
      const { id } = await context.params;
      const data = await validateBody(request, UpdateDocumentContentSchema);

      const doc = await updateDocumentContent(id, user.id, data.content);
      if (!doc) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
      }

      logger.info("Document updated", { userId: user.id, documentId: id });
      return NextResponse.json(doc, { status: 200 });
    } catch (err) {
      return handleApiError(err);
    }
  });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return withHttpLogging(request, async () => {
    try {
      const user = await requireAuth();
      const { id } = await context.params;

      const deleted = await softDeleteDocument(id, user.id);
      if (!deleted) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
      }

      logger.info("Document deleted", { userId: user.id, documentId: id });
      return new NextResponse(null, { status: 204 });
    } catch (err) {
      return handleApiError(err);
    }
  });
}
