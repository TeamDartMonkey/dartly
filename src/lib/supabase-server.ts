import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import logger from "@/lib/logger";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // The set call can throw in Server Components (read-only context).
          // That's expected and benign — middleware refreshes the session
          // there. We log only in non-production so genuine misconfigurations
          // (invalid cookie options, etc.) surface during development.
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch (err) {
            if (env.NODE_ENV !== "production") {
              logger.debug("supabase cookie set failed (likely server-component context)", {
                message: err instanceof Error ? err.message : String(err),
              });
            }
          }
        },
      },
    }
  );
}
