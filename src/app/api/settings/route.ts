import { type NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { withHttpLogging } from "@/lib/api-wrapper";
import logger from "@/lib/logger";
import { requireAuth } from "@/lib/requireAuth";
import { validateBody } from "@/lib/validate-body";
import { getSettings, upsertSettings } from "@/services/settings";
import { UserPreferencesSchema } from "@/types/schemas";

export async function GET(request: NextRequest) {
  return withHttpLogging(request, async () => {
    try {
      const user = await requireAuth();
      const preferences = await getSettings(user.id);
      return NextResponse.json(preferences, { status: 200 });
    } catch (err) {
      return handleApiError(err);
    }
  });
}

export async function PATCH(request: NextRequest) {
  return withHttpLogging(request, async () => {
    try {
      const user = await requireAuth();
      const patch = await validateBody(request, UserPreferencesSchema);
      const preferences = await upsertSettings(user.id, patch);
      logger.info("Settings updated", { userId: user.id });
      return NextResponse.json(preferences, { status: 200 });
    } catch (err) {
      return handleApiError(err);
    }
  });
}
