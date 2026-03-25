const features = [
  {
    icon: "⬡",
    title: "Next.js 16 App Router",
    description: "Server components, streaming, layouts, and file-based routing.",
  },
  {
    icon: "◈",
    title: "TypeScript — strict",
    description: "Full strict mode. Types checked on every commit via lint-staged.",
  },
  {
    icon: "◎",
    title: "Tailwind CSS v4",
    description: "Utility-first CSS with the new @theme API and zero-config PostCSS.",
  },
  {
    icon: "◷",
    title: "Vitest + Testing Library",
    description: "Fast unit tests with jsdom, v8 coverage, and jest-dom matchers.",
  },
  {
    icon: "◉",
    title: "Winston Logger",
    description:
      "Structured JSON in production, pretty console in dev, with sensitive-key redaction.",
  },
  {
    icon: "◑",
    title: "Rate Limiting",
    description: "Per-route limiting via rate-limiter-flexible. Redis-ready for multi-instance.",
  },
  {
    icon: "◬",
    title: "Security Headers",
    description: "CSP, X-Frame-Options, Referrer-Policy, and Permissions-Policy globally applied.",
  },
  {
    icon: "◫",
    title: "Docker",
    description: "Multi-stage build, standalone output, non-root user, health-checked Compose.",
  },
  {
    icon: "◐",
    title: "Husky + lint-staged",
    description: "ESLint and Prettier run automatically on staged files before every commit.",
  },
  {
    icon: "◇",
    title: "Zod Env Validation",
    description:
      "Environment variables validated at startup with Zod. Fail fast on misconfiguration.",
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-8">
      {/* Hero */}
      <div className="flex w-full max-w-3xl flex-col items-center pb-24 text-center">
        <div className="mb-[60px] inline-flex items-center gap-3 rounded-full border border-white/8 bg-white/[0.03] px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] text-white/40">
          <span className="size-1.5 rounded-full bg-emerald-400/80" />
          Next.js 16 · Bun · TypeScript
        </div>

        <h1 className="text-6xl font-medium tracking-tight text-white/90 sm:text-7xl">
          Bun Starter
        </h1>

        <p className="mt-[44px] max-w-lg text-[15px] leading-relaxed text-white/30">
          A production-ready foundation. Delete what you don&apos;t need, build what you do.
        </p>

        <div className="mt-[64px] flex items-center gap-5">
          <a
            href="/api/health"
            className="rounded-lg bg-white/90 px-7 py-3.5 text-[13px] font-medium text-black transition-all hover:bg-white"
          >
            GET /api/health
          </a>
          <a
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-white/10 px-7 py-3.5 text-[13px] font-medium text-white/40 transition-all hover:border-white/20 hover:text-white/70"
          >
            Docs →
          </a>
        </div>
      </div>

      {/* Feature grid */}
      <div className="w-full max-w-5xl">
        <div className="mb-10 border-b border-white/[0.06]" />
        <div className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-lg px-8 py-10 transition-colors hover:bg-white/[0.02]"
            >
              <span
                aria-hidden="true"
                className="mb-5 block text-2xl text-white/10 transition-colors group-hover:text-white/20"
              >
                {feature.icon}
              </span>
              <h2 className="mb-3 text-[13px] font-medium tracking-wide text-white/70">
                {feature.title}
              </h2>
              <p className="text-[13px] leading-[1.7] text-white/25">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="h-40" />
    </main>
  );
}
