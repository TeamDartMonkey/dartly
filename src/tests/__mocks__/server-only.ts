// Vitest mock for the `server-only` package.
// In Next.js, `server-only` uses the "react-server" conditional export (a no-op).
// Vitest doesn't activate that condition, so without this alias it throws.
// vitest.config.ts maps `server-only` → this file for all test runs.
export {};
