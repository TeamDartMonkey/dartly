import "@testing-library/jest-dom";

// Provide minimum env vars so any accidental import of "@/lib/env" during
// tests does not throw. Tests that need specific values should still mock
// "@/lib/env" via vi.mock for clarity.
const e = process.env as Record<string, string | undefined>;
e.NODE_ENV ??= "test";
e.NEXT_PUBLIC_SUPABASE_URL ??= "https://example.supabase.co";
e.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??= "test-anon-key";
e.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test";
e.SUPABASE_DOCUMENTS_BUCKET ??= "test-bucket";
