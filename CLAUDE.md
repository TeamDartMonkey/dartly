# CLAUDE.md — Dartly

ATS for Candidates: Job application tracking system built with Next.js, Supabase, and Prisma.

## Architecture Decisions (locked)

These choices are final. Do not suggest alternatives or migrations.

| Component      | Choice                                     | Rationale                                                 |
| -------------- | ------------------------------------------ | --------------------------------------------------------- |
| Backend        | Supabase + Prisma                           | Managed PostgreSQL with built-in auth and real-time features |
| Database       | PostgreSQL                                  | Relational DB, Supabase-managed for scalability |
| ORM           | Prisma (v6)                                  | Type-safe database client, excellent DX |
| Auth           | Supabase Auth (email/password)               | Built-in auth with email/password registration; OAuth to be added |
| CSS            | Tailwind CSS v4 with `@theme` API       | PostCSS plugin (`@tailwindcss/postcss`)        |
| Testing        | Vitest + Testing Library + jsdom          | Fast, ESM-native, React 19 compatible |
| Linting/Format  | Biome                                        | All-in-one linter + formatter; pre-commit hooks enforce style |
| CI/CD          | GitHub Actions                               | Automated build, test, lint, and deployment checks |
| Deployment      | Vercel                                      | Edge deployment, preview URLs for PRs, automatic SSL |
| AI Provider     | Google Gemini (`gemini-2.5-flash`)          | Resume, cover letter, and content rewrite generation via `@google/generative-ai` |

## Conventions

### Imports and paths

- Path alias: `@/` → `src/`
- Direct imports preferred over barrel imports for tree-shaking
- Barrel exports (`index.ts`) with actual exports: `lib/`, `utils/`, `services/`, `types/`
- Empty `index.ts` placeholder files in `components/`, `hooks/`, `constants/` — for git tracking only, do not add barrel exports until there is content to export

### Server-only enforcement

- All `src/lib/` files use `"server-only"` import (either directly or via the barrel)
- `src/lib/index.ts` has `import "server-only"` at the top

### File organization

- `src/lib/` — server-only infrastructure (logger, env, rate-limit, api-error, api-wrapper, requireAuth, validate-body, supabase-server)
- `src/utils/` — shared utilities safe for client and server (cn, search-jobs, sort-jobs, deadline)
- `src/services/` — business logic, external API clients (auth, prisma, supabase, jobs, documents, profile, settings, activities, metrics, ai)
- `src/types/` — TypeScript type definitions (activity, document, job, profile, settings) and Zod validation schemas (`types/schemas/`)
- `src/constants/` — app-wide constants (job stages, job filters)
- `src/hooks/` — custom React hooks (use-view-mode, use-document-view-mode)
- `src/styles/` — CSS stylesheets (jakes-resume.css for resume rendering)
- `src/proxy.ts` — middleware logic for route protection and session refresh
- `src/scripts/` — database seed and clean scripts
- `src/app/api/` — API route handlers (auth, health, jobs, documents, profile, settings, metrics, ai/cover-letter, ai/resume, ai/rewrite, ai/research)
- `src/tests/` — test files organized by module (api, components, hooks, lib, services, utils, \_\_mocks\_\_)

### Route structure

The app uses Next.js route groups:

- `src/app/(auth)/` — public pages: `login/`, `register/`, `forgot-password/`, `reset-password/`
- `src/app/(app)/` — protected pages: `dashboard/`, `dashboard/[jobId]/` (job detail with overview, timeline, followups, interviews, documents, research, prep-notes sections), `documents/`, `documents/[id]/` (document detail), `profile/`, `settings/`, with shared `layout.tsx` that checks auth and renders sidebar

### Code style

- No empty placeholder files in `src/app/` or `src/lib/` — every file must have content
- Exception: `src/components/index.ts`, `src/hooks/index.ts`, `src/constants/index.ts` are intentionally empty (git tracking placeholders)
- No `console.log` / `console.error` in server code — use `logger` from `@/lib/logger`
- Exception: `error.tsx` is a client component and uses `console.error` (cannot import server logger)
- Security headers defined in `next.config.ts` via `headers()`, not in middleware
- Use Prisma client with type-safe queries, avoid raw SQL
- All API responses follow consistent error format: `{ error: string }`

### Database conventions

- Use Prisma models defined in `prisma/schema.prisma`
- Foreign keys enforce referential integrity
- Row-level security (RLS) policies in `supabase/rls-policies.sql` exist as defense-in-depth for any direct supabase-js calls (not used by Prisma)
- All service-layer queries must explicitly filter by `userId` from `requireAuth()`
- Migrations managed via Prisma CLI: `bun run prisma:migrate`

### Authentication conventions

- Use Supabase Auth for session management
- Route protection via `src/app/(app)/layout.tsx` (checks session, redirects to `/login` if unauthenticated)
- Public routes: `/login`, `/register`, `/forgot-password`, `/reset-password`
- Protected routes: `/dashboard`, `/documents`, `/profile`, `/settings`
- Email/password registration via Supabase Auth (OAuth to be added later)
- **Every API route must call `requireAuth()`** at the top of its handler (or explicitly opt out with a comment explaining why). Do not assume middleware is protecting `/api`.
- Use `validateBody(request, schema)` from `@/lib/validate-body` for request body validation with Zod schemas from `@/types/schemas/`

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
- All `src/lib/` files import `"server-only"` (directly or via barrel)
- No `console.log` / `console.error` in server code (use logger)
- Manual `userId` scoping in services + RLS defense-in-depth in Supabase
- All API routes are protected with auth checks
- Rate limiting configured on public endpoints
- CI/CD pipeline runs successfully on GitHub

## Do NOT Change

These are intentional decisions. Do not "fix" or suggest alternatives:

- **No `suppressHydrationWarning`** on `<html>` — unnecessary without theme toggle
- **`unsafe-inline` in CSP** `style-src` and `script-src` — required by Next.js
- **Biome over ESLint/Prettier** — project decision for all-in-one tool
- **Winston over Pino** — project decision for file transports and format flexibility
- **In-memory rate limiter** (`rate-limiter-flexible`) — Redis swap documented; default is intentionally zero-infra
- **`console.error` in `error.tsx`** — client component, cannot use server-side logger
- **No axios** — `fetch` is the web standard
- **`zod/v4` import path** — Zod v4 requires this, not `zod`
- **Single font (Geist Mono)** — monospace-first design choice
- **Supabase Auth + RLS** — account isolation via database policies and manual `userId` scoping in service layer, not app-level filtering alone
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
bun run prisma:studio    # Open Prisma Studio for database inspection
bun run prisma:migrate   # Create and apply database migrations
bun run prisma:generate  # Regenerate Prisma client after schema changes
bun run db:seed      # Seed the database
bun run db:clean     # Clean and re-seed the database
```
