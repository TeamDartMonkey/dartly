import "server-only";
import { createClient } from "@/lib/supabase-server";
import { ApiError } from "@/lib/api-error";
import { childLogger } from "@/lib/logger";
import type { User } from "@supabase/supabase-js";

const log = childLogger("auth");

/**
 * Extracts and validates the authenticated user from the Supabase session.
 * Throws ApiError(401) if the user is not authenticated.
 *
 * Usage in API route handlers:
 *   const user = await requireAuth();
 *   // user.id is the authenticated user's ID — use it to scope all queries
 */
export async function requireAuth(): Promise<User> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    log.warn("Unauthorized request", { error: error?.message });
    throw new ApiError(401, "Unauthorized");
  }

  return user;
}
