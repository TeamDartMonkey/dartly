import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background">
      <p className="mb-1 text-xs text-white/30">404</p>
      <h2 className="mb-6 text-lg font-medium text-white/80">Page not found</h2>
      <Link
        href="/"
        className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition-colors hover:border-white/20 hover:text-white/80"
      >
        Return home
      </Link>
    </main>
  );
}
