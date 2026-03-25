# CLAUDE.md — nextjs-bun-starter

## Project Overview

Production-ready Next.js 16 starter template built with Bun. Designed as a minimal, opinionated foundation for new projects — not a kitchen-sink boilerplate.

- **Runtime**: Bun (dev/build), Node 22 Alpine (Docker production)
- **Framework**: Next.js 16 with App Router, React 19, React Compiler enabled
- **Language**: TypeScript (strict mode, `target: ES2022`)

## Architecture Decisions (locked)

These choices are final. Do not suggest alternatives or migrations.

| Component      | Choice                                     | Rationale                                                 |
| -------------- | ------------------------------------------ | --------------------------------------------------------- |
| Logger         | Winston                                    | File transports, format flexibility, redaction support    |
| Rate limiting  | rate-limiter-flexible (in-memory)          | Simple, zero-infra default; Redis swap documented in code |
| Env validation | Zod v4 (`zod/v4` import)                   | Runtime validation with `safeParse`, `prettifyError`      |
| CSS            | Tailwind v4 with `@theme` API              | PostCSS plugin (`@tailwindcss/postcss`)                   |
| Testing        | Vitest + Testing Library + jsdom           | Fast, ESM-native, React 19 compatible                     |
| Middleware     | `src/proxy.ts`                             | Next.js 16 convention (replaces `middleware.ts`)          |
| CSP            | `unsafe-inline` for styles and scripts     | Required by Next.js inline scripts/styles                 |
| Error handling | `ApiError` class + `handleApiError` helper | In `src/lib/api-error.ts`                                 |
| Docker         | Multi-stage build, standalone output       | Bun builds, Node 22 Alpine runs                           |
| Font           | Geist Mono only                            | Monospace-first design, single font load                  |
| Utilities      | `clsx` + `tailwind-merge` via `cn()`       | In `src/utils/cn.ts`                                      |
| Formatting     | Biome + Husky + lint-staged                | All-in-one linter + formatter; pre-commit hooks enforce style |

## Conventions

### Imports and paths

- Path alias: `@/` → `src/`
- Direct imports preferred over barrel imports for tree-shaking
- Barrel exports (`index.ts`) with actual exports: `lib/`, `utils/`
- Empty `index.ts` placeholder files in `components/`, `hooks/`, `services/`, `types/`, `constants/` — for git tracking only, do not add barrel exports until there is content to export

### Server-only enforcement

- All `src/lib/` files use `"server-only"` import (either directly or via the barrel)
- `src/lib/index.ts` has `import "server-only"` at the top

### File organization

- `src/lib/` — server-only infrastructure (logger, env, rate-limit, api-error, api-wrapper)
- `src/utils/` — shared utilities safe for client and server (`cn`)
- `src/app/api/` — API route handlers
- `src/tests/` — test files
- `src/proxy.ts` — middleware (Next.js 16)

### Code style

- No empty placeholder files in `src/app/` or `src/lib/` — every file must have content
- Exception: `src/components/index.ts`, `src/hooks/index.ts`, `src/services/index.ts`, `src/types/index.ts`, `src/constants/index.ts` are intentionally empty (git tracking placeholders)
- No `console.log` / `console.error` in server code — use `logger` from `@/lib/logger`
- Exception: `error.tsx` is a client component and uses `console.error` (cannot import server logger)
- Security headers defined in `next.config.ts` via `headers()`, not in middleware

## Quality Checklist

Run these before considering the starter complete:

```bash
bun run test          # Vitest test suite passes
bun run type-check    # tsc --noEmit passes
bun lint              # Biome lint passes
bun run build         # Next.js build produces no warnings
```

Additionally verify:

- No unused dependencies in `package.json`
- `.env.example` documents all env vars (`NODE_ENV`, `LOG_LEVEL`, `LOG_DIR`, `NEXT_PUBLIC_APP_URL`)
- README env var table matches `.env.example`
- All `src/lib/` files import `"server-only"` (directly or via barrel)
- No `console.log` / `console.error` in server code (use logger)

## Do NOT Change

These are intentional decisions. Do not "fix" or suggest alternatives:

- **No `suppressHydrationWarning`** on `<html>` — there is no theme toggle, so it's unnecessary
- **`unsafe-inline` in CSP** `style-src` and `script-src` — required by Next.js
- **Winston over Pino** — project decision for file transports and format flexibility
- **In-memory rate limiter** — Redis swap is documented in `rate-limit.ts` comments; default is intentionally zero-infra
- **`console.error` in `error.tsx`** — client component, cannot use server-side logger
- **No axios** — removed intentionally; `fetch` is the standard
- **`zod/v4` import path** — Zod v4 requires this import path, not `zod`
- **Single font (Geist Mono)** — monospace-first design choice, not an oversight
- **`_request` unused param in `proxy.ts`** — placeholder for future middleware logic

## Scripts Reference

```
bun dev              # Start dev server
bun run build        # Production build
bun start            # Start production server
bun lint             # Run Biome lint (with auto-fix)
bun run format       # Run Biome formatter
bun run type-check   # TypeScript type checking
bun run test         # Run tests
bun run test:ui      # Vitest UI
bun run test:coverage # Coverage report
```
