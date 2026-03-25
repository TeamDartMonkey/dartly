"use client";

import { useEffect } from "react";

// biome-ignore lint/suspicious/noShadowRestrictedNames: Next.js requires this export name
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Client component — cannot use server-side logger.
  // Replace with an error reporting service (e.g. Sentry) in production.
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background">
      <p className="mb-1 text-xs text-white/30">500</p>
      <h2 className="mb-6 text-lg font-medium text-white/80">Something went wrong</h2>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition-colors hover:border-white/20 hover:text-white/80"
      >
        Try again
      </button>
    </main>
  );
}
