import { type NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { withHttpLogging } from "@/lib/api-wrapper";
import logger from "@/lib/logger";
import { requireAuth } from "@/lib/requireAuth";
import { validateBody } from "@/lib/validate-body";
import { updateDocumentStatus } from "@/services/documents";
import { UpdateDocumentStatusSchema } from "@/types/schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  return withHttpLogging(request, async () => {
    try {
      const user = await requireAuth();
      const { id } = await context.params;
      const { status } = await validateBody(request, UpdateDocumentStatusSchema);

      const doc = await updateDocumentStatus(id, user.id, status);
      if (!doc) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
      }

      logger.info("Document status updated", {
        userId: user.id,
        documentId: id,
        status,
      });
      return NextResponse.json(doc, { status: 200 });
    } catch (err) {
      return handleApiError(err);
    }
  });
}
