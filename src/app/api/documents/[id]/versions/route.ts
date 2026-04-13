import { type NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { withHttpLogging } from "@/lib/api-wrapper";
import logger from "@/lib/logger";
import { requireAuth } from "@/lib/requireAuth";
import { validateBody } from "@/lib/validate-body";
import { createDocumentVersion, getDocumentVersions } from "@/services/documents";
import { UpdateDocumentContentSchema } from "@/types/schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  return withHttpLogging(request, async () => {
    try {
      const user = await requireAuth();
      const { id } = await context.params;

      const versions = await getDocumentVersions(id, user.id);
      if (!versions) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
      }

      return NextResponse.json(versions, { status: 200 });
    } catch (err) {
      return handleApiError(err);
    }
  });
}

export async function POST(request: NextRequest, context: RouteContext) {
  return withHttpLogging(request, async () => {
    try {
      const user = await requireAuth();
      const { id } = await context.params;
      const data = await validateBody(request, UpdateDocumentContentSchema);

      const version = await createDocumentVersion(id, user.id, data.content);
      if (!version) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
      }

      logger.info("Document version created", { userId: user.id, documentId: id });
      return NextResponse.json(version, { status: 201 });
    } catch (err) {
      return handleApiError(err);
    }
  });
}
