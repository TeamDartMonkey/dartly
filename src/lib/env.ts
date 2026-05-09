import "server-only";
import { z } from "zod/v4";

// Schema defines all environment variables with their types and constraints.
// Optional vars have defaults or are truly optional. Required vars cause
// the app to exit with a clear error message if missing.
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.enum(["error", "warn", "info", "http", "debug"]).optional(),
  LOG_DIR: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(1).optional(),
  AUTH_GOOGLE_ID: z.string().min(1).optional(),
  AUTH_GOOGLE_SECRET: z.string().min(1).optional(),
  GEMINI_API_KEY: z.string().min(1).optional(),
  SUPABASE_DOCUMENTS_BUCKET: z.string().min(1),
});
// safeParse allows us to provide a custom error message and surface a clear
// error on invalid env vars. We throw rather than process.exit so tests and
// other host processes can fail without being hard-killed.

function parseEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const message = `Invalid environment variables:\n${z.prettifyError(result.error)}`;
    process.stderr.write(`${message}\n`);
    throw new Error(message);
  }

  return result.data;
}

export const env = parseEnv();
