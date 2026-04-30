import { type NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { withHttpLogging } from "@/lib/api-wrapper";
import logger from "@/lib/logger";
import { requireAuth } from "@/lib/requireAuth";
import { archiveDocument } from "@/services/documents";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  return withHttpLogging(request, async () => {
    try {
      const user = await requireAuth();
      const { id } = await context.params;

      const doc = await archiveDocument(id, user.id);
      if (!doc) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
      }

      logger.info("Document archived", { userId: user.id, documentId: id });
      return NextResponse.json(doc, { status: 200 });
    } catch (err) {
      return handleApiError(err);
    }
  });
}
