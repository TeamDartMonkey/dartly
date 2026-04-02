import "server-only";
import { z } from "zod/v4";

// Schema defines all environment variables with their types and constraints.
// Optional vars have defaults or are truly optional. Required vars cause
// the app to exit with a clear error message if missing.
const envSchema = z.object({
  // Zod v4 requires this import path (not "zod").
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.enum(["error", "warn", "info", "http", "debug"]).optional(),
  LOG_DIR: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.url().optional(),
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(1).optional(),
  AUTH_GOOGLE_ID: z.string().min(1).optional(),
  AUTH_GOOGLE_SECRET: z.string().min(1).optional(),
});
// safeParse allows us to provide a custom error message and exit gracefully
// instead of throwing an unhandled exception on invalid env vars.

function parseEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    process.stderr.write("Invalid environment variables:\n");
    process.stderr.write(`${z.prettifyError(result.error)}\n`);
    process.exit(1);
  }

  return result.data;
}

export const env = parseEnv();
