import { type NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { withHttpLogging } from "@/lib/api-wrapper";
import { env } from "@/lib/env";
import { checkRateLimit } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/requireAuth";
import { createClient } from "@/lib/supabase-server";
import { prisma } from "@/services/prisma";

type RouteContext = { params: Promise<{ id: string }> };

const SIGNED_URL_TTL_SECS = 5 * 60; // 5 minutes — short-lived to limit blast radius if leaked

export async function GET(request: NextRequest, context: RouteContext) {
  return withHttpLogging(request, async () => {
    const limited = await checkRateLimit(request, {
      id: "api/documents/signed-url",
      limit: 30,
      windowSecs: 60,
    });
    if (limited) return limited;

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

      const fileUrl = doc.versions[0].fileUrl;
      if (!fileUrl) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const supabase = await createClient();

      const { data, error } = await supabase.storage
        .from(env.SUPABASE_DOCUMENTS_BUCKET)
        .createSignedUrl(fileUrl, SIGNED_URL_TTL_SECS);

      if (error || !data) {
        return NextResponse.json({ error: "Could not generate signed URL" }, { status: 500 });
      }

      // Note: the URL itself is not logged (logger redacts query strings).
      return NextResponse.json({ url: data.signedUrl }, { status: 200 });
    } catch (err) {
      return handleApiError(err);
    }
  });
}
