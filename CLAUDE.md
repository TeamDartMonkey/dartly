# CLAUDE.md — Dartly

ATS for Candidates: Job application tracking system built with Next.js, Supabase, and Prisma.

## Architecture Decisions (locked)

These choices are final. Do not suggest alternatives or migrations.

| Component      | Choice                                     | Rationale                                                 |
| -------------- | ------------------------------------------ | --------------------------------------------------------- |
| Backend        | Supabase + Prisma                           | Managed PostgreSQL with built-in auth and real-time features |
| Database       | PostgreSQL                                  | Relational DB, Supabase-managed for scalability |
| ORM           | Prisma                                     | Type-safe database client, excellent DX |
| Auth           | OAuth                                       | Social login integration, no password management overhead |
| CSS            | Tailwind CSS v4 with `@theme` API       | PostCSS plugin (`@tailwindcss/postcss`)        |
| Testing        | Vitest + Testing Library + jsdom          | Fast, ESM-native, React 19 compatible |
| Linting/Format  | Biome                                        | All-in-one linter + formatter; pre-commit hooks enforce style |
| CI/CD          | GitHub Actions                               | Automated build, test, lint, and deployment checks |
| Deployment      | Vercel                                      | Edge deployment, preview URLs for PRs, automatic SSL |
| AI Provider     | TBD                                         | Integrated AI services for resume/document generation |

## Conventions

### Imports and paths

- Path alias: `@/` → `src/`
- Direct imports preferred over barrel imports for tree-shaking
- Barrel exports (`index.ts`) with actual exports: `lib/`, `utils/`, `services/`, `types/`, `constants/`
- Empty `index.ts` placeholder files in `components/`, `hooks/` — for git tracking only, do not add barrel exports until there is content to export

### Server-only enforcement

- All `src/lib/` files use `"server-only"` import (either directly or via the barrel)
- `src/lib/index.ts` has `import "server-only"` at the top

### File organization

- `src/lib/` — server-only infrastructure (logger, env, rate-limit, api-error, api-wrapper)
- `src/utils/` — shared utilities safe for client and server (cn)
- `src/services/` — business logic, external API clients (Supabase client, AI services)
- `src/types/` — TypeScript type definitions shared across the app
- `src/constants/` — app-wide constants (job statuses, document types, etc.)
- `src/app/api/` — API route handlers
- `src/tests/` — test files organized by module
- `src/proxy.ts` — middleware (Next.js 16 convention)

### Code style

- No empty placeholder files in `src/app/` or `src/lib/` — every file must have content
- Exception: `src/components/index.ts`, `src/hooks/index.ts`, `src/services/index.ts`, `src/types/index.ts`, `src/constants/index.ts` are intentionally empty (git tracking placeholders)
- No `console.log` / `console.error` in server code — use `logger` from `@/lib/logger`
- Exception: `error.tsx` is a client component and uses `console.error` (cannot import server logger)
- Security headers defined in `next.config.ts` via `headers()`, not in middleware
- Use Prisma client with type-safe queries, avoid raw SQL
- All API responses follow consistent error format: `{ error: string }`

### Database conventions

- Use Prisma models defined in `prisma/schema.prisma`
- Foreign keys enforce referential integrity
- Row-level security (RLS) policies in Supabase for account isolation
- All queries account-scoped via RLS (no manual user_id filtering in app code)
- Migrations managed via Prisma CLI: `bun prisma migrate dev`

### Authentication conventions

- Use Supabase Auth for session management
- Protect routes using middleware that checks Supabase session
- Public routes: home, login, signup
- Protected routes: dashboard, profile, document library
- Use OAuth providers for social login (Google, GitHub, etc.)

### API conventions

- RESTful design where appropriate
- Use standardized HTTP status codes (200, 201, 400, 401, 403, 404, 429, 500)
- Rate limit public endpoints via `checkRateLimit` helper
- Log all API requests/responses via `withHttpLogging` wrapper
- Handle errors via `handleApiError` helper for consistent responses

## Quality Checklist

Run these before considering a release complete:

```bash
bun run test          # Vitest test suite passes with adequate coverage
bun run type-check    # tsc --noEmit passes
bun lint              # Biome lint passes
bun run build         # Next.js build produces no warnings
```

Additionally verify:

- No unused dependencies in `package.json`
- `.env.example` documents all required env vars
- README env var table matches `.env.example`
- All `src/lib/` files import `"server-only"` (directly or via barrel)
- No `console.log` / `console.error` in server code (use logger)
- RLS policies enforce account isolation in Supabase
- All API routes are protected with auth checks
- Rate limiting configured on public endpoints
- CI/CD pipeline runs successfully on GitHub

## Do NOT Change

These are intentional decisions. Do not "fix" or suggest alternatives:

- **No `suppressHydrationWarning`** on `<html>` — unnecessary without theme toggle
- **`unsafe-inline` in CSP** `style-src` and `script-src` — required by Next.js
- **Biome over ESLint/Prettier** — project decision for all-in-one tool
- **Winston over Pino** — project decision for file transports and format flexibility
- **In-memory rate limiter** — Redis swap documented; default is intentionally zero-infra
- **`console.error` in `error.tsx`** — client component, cannot use server-side logger
- **No axios** — `fetch` is the web standard
- **`zod/v4` import path** — Zod v4 requires this, not `zod`
- **Single font (Geist Mono)** — monospace-first design choice
- **Supabase Auth + RLS** — account isolation via database policies, not app-level filtering
- **OAuth only** — no custom password flows for simplicity
- **Prisma ORM** — type-safe queries, no raw SQL in app code

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
bun prisma studio    # Open Prisma Studio for database inspection
bun prisma migrate dev # Create and apply database migrations
bun prisma generate   # Regenerate Prisma client after schema changes
```
