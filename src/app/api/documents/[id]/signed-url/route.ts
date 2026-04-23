import { type NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { withHttpLogging } from "@/lib/api-wrapper";
import { env } from "@/lib/env";
import { requireAuth } from "@/lib/requireAuth";
import { createClient } from "@/lib/supabase-server";
import { prisma } from "@/services/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  return withHttpLogging(request, async () => {
    try {
      const user = await requireAuth();
      const { id } = await context.params;

      // Verify ownership and get latest version with a fileUrl
      const doc = await prisma.document.findFirst({
        where: { id, userId: user.id, isDeleted: false },
        include: {
          versions: {
            where: { fileUrl: { not: null } },
            orderBy: { versionNumber: "desc" },
            take: 1,
          },
        },
      });

      if (!doc || doc.versions.length === 0) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const fileUrl = doc.versions[0].fileUrl as string;
      const supabase = await createClient();

      const { data, error } = await supabase.storage
        .from(env.SUPABASE_DOCUMENTS_BUCKET)
        .createSignedUrl(fileUrl, 60 * 60);

      if (error || !data) {
        return NextResponse.json({ error: "Could not generate signed URL" }, { status: 500 });
      }

      return NextResponse.json({ url: data.signedUrl }, { status: 200 });
    } catch (err) {
      return handleApiError(err);
    }
  });
}