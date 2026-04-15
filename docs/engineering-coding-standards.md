# Engineering and Coding Standards Context Document

Standards for how code is written, structured, tested, and shipped in the Dartly project. Covers conventions, patterns, and quality gates that all contributors must follow.

---

## 1. Tech Stack

These choices are locked. Do not suggest alternatives or migrations.

| Layer | Choice | Version | Notes |
|-------|--------|---------|-------|
| Framework | Next.js (App Router) | 16 | React Server Components by default |
| Runtime | React | 19 | With React Compiler (`babel-plugin-react-compiler`) |
| Language | TypeScript | Strict mode | `@/*` path alias maps to `src/` |
| Package Manager | Bun | Latest | All scripts run via `bun` or `bun run` |
| Database | PostgreSQL | Supabase-managed | No self-hosted Postgres |
| ORM | Prisma | 6 | Type-safe client, no raw SQL in app code |
| Auth | Supabase Auth | Email/password | OAuth planned, not yet implemented |
| CSS | Tailwind CSS | v4 | `@theme` API, PostCSS plugin (`@tailwindcss/postcss`) |
| Linting/Format | Biome | Latest | All-in-one linter + formatter; replaces ESLint/Prettier |
| Testing | Vitest + Testing Library | Latest | jsdom environment, v8 coverage |
| Logging | Winston | Latest | File transports in prod, console in dev |
| Validation | Zod | v4 | Import from `zod/v4`, not `zod` |
| CI/CD | GitHub Actions | — | Lint, type-check, test, build on every PR |
| Deployment | Vercel | — | Standalone output, edge deployment |

---

## 2. Project Structure

### 2.1 Directory Layout

```
src/
├── app/                  # Next.js App Router (pages + API routes)
│   ├── (auth)/           # Public route group
│   │   ├── login/        # Login page
│   │   ├── register/     # Registration page
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── (app)/            # Protected route group
│   │   ├── layout.tsx    # Shared auth check + sidebar layout
│   │   ├── dashboard/
│   │   ├── documents/
│   │   ├── profile/
│   │   └── settings/
│   ├── api/              # API route handlers
│   │   ├── ai/           # AI generation endpoints
│   │   ├── auth/         # Auth endpoints (register, login)
│   │   ├── documents/    # Document CRUD endpoints
│   │   ├── health/       # Health check endpoint
│   │   ├── jobs/         # Job CRUD endpoints
│   │   ├── metrics/      # Metrics endpoints
│   │   ├── profile/      # Profile endpoints
│   │   └── settings/     # User settings endpoints
│   ├── layout.tsx        # Root layout (server component)
│   ├── page.tsx          # Home page
│   ├── error.tsx         # Error boundary (client component)
│   ├── loading.tsx       # Root loading state
│   └── not-found.tsx     # 404 page
├── components/           # React components (organized by feature)
│   ├── auth/             # Auth forms (login, register, forgot/reset password)
│   ├── dashboard/        # Dashboard components (job-card, filter-bar, metrics-panel, etc.)
│   ├── documents/        # Document components (generate buttons, rewrite panel)
│   ├── profile/          # Profile sections (identity, experience, education, skills)
│   ├── settings/         # Settings sections (account, preferences, notifications)
│   └── ui/               # Shared UI primitives (button, input, modal, sidebar, toast, etc.)
├── lib/                  # Server-only infrastructure
│   ├── api-error.ts      # ApiError class + error response helpers
│   ├── api-wrapper.ts    # withHttpLogging higher-order function
│   ├── env.ts            # Zod-validated environment variables
│   ├── logger.ts         # Winston logger with redaction
│   ├── rate-limit.ts     # Rate limiter (rate-limiter-flexible)
│   ├── requireAuth.ts    # Auth guard — extracts user from session, throws 401 if missing
│   ├── supabase-server.ts # Server-side Supabase client (SSR)
│   ├── validate-body.ts  # Zod-based request body validation helper
│   └── index.ts          # Barrel export with "server-only" import
├── services/             # Business logic and external API clients
│   ├── activities.ts     # Job activity service
│   ├── ai.ts             # AI generation service (placeholder)
│   ├── auth.ts           # Auth service (signUp, signIn, signOut)
│   ├── documents.ts      # Document CRUD service
│   ├── jobs.ts           # Job CRUD service
│   ├── metrics.ts        # Metrics/aggregation service
│   ├── prisma.ts         # Prisma client singleton
│   ├── profile.ts        # Profile CRUD service
│   ├── settings.ts       # User settings service
│   ├── supabase.ts       # Browser-side Supabase client
│   └── index.ts          # Barrel export (prisma)
├── types/                # Shared TypeScript type definitions
│   ├── activity.ts
│   ├── document.ts
│   ├── job.ts
│   ├── profile.ts
│   ├── settings.ts
│   ├── schemas/          # Zod validation schemas
│   │   ├── activity.ts
│   │   ├── auth.ts
│   │   ├── document.ts
│   │   ├── job.ts
│   │   ├── profile.ts
│   │   └── settings.ts
│   └── index.ts          # Barrel export (form data interfaces)
├── utils/                # Client+server safe utilities
│   ├── cn.ts             # clsx + tailwind-merge utility
│   ├── search-jobs.ts    # Job search/filter utility
│   ├── sort-jobs.ts      # Job sorting utility
│   ├── deadline.ts       # Deadline formatting utility
│   └── index.ts          # Barrel export (cn, searchJobs)
├── constants/            # App-wide constants
│   ├── job-stages.ts     # Job stage definitions
│   └── job-filters.ts    # Job filter constants
├── hooks/                # Custom React hooks
│   └── use-view-mode.ts  # Card/list view toggle hook
├── scripts/              # Database utility scripts
│   ├── seed.ts           # Database seeding
│   └── clean-seed.ts     # Clean and re-seed
├── tests/                # Test suites organized by module
│   ├── __mocks__/        # Shared mock factories
│   ├── api/              # API route tests
│   ├── components/       # Component tests (organized by feature)
│   ├── hooks/            # Hook tests
│   ├── lib/              # Infrastructure tests
│   ├── services/         # Service tests
│   ├── utils/            # Utility tests
│   └── setup.ts          # Test setup (Testing Library matchers)
└── proxy.ts              # Edge proxy for auth session checks
```

### 2.2 File Organization Rules

| Rule | Detail |
|------|--------|
| `src/lib/` is server-only | Every file imports `"server-only"` directly or via the barrel (`@/lib`) |
| `src/utils/` is universal | Safe for both client and server imports |
| `src/services/` holds business logic | Services throw `ApiError`; route handlers catch and respond |
| No empty files in `src/app/` or `src/lib/` | Every file must have content |
| Placeholder `index.ts` files | `components/`, `hooks/`, `constants/` have empty `index.ts` for git tracking — do not add barrel exports until there is content |
| Barrel exports with content | `lib/`, `utils/`, `services/`, `types/` have barrel exports re-exporting their modules |

---

## 3. TypeScript and Code Style

### 3.1 TypeScript Configuration

- **Strict mode** enabled (`strict: true` in `tsconfig.json`)
- **Target:** ES2022
- **JSX:** React JSX transform (no `import React` needed)
- **Path alias:** `@/*` resolves to `./src/*`
- **Incremental compilation** enabled for dev speed

### 3.2 Biome Configuration

Biome handles both linting and formatting. No ESLint or Prettier.

| Setting | Value |
|---------|-------|
| Indent | 2 spaces |
| Line width | 100 characters |
| Quotes | Double quotes |
| Semicolons | Always |
| Trailing commas | ES5 (`es5`) |
| Unused variables | Warning (not error) |
| Unused imports | Warning (not error) |

Pre-commit hooks run Biome via lint-staged on all staged files. Code that fails Biome will not commit.

### 3.3 Import Conventions

```typescript
// Use the path alias — never relative imports that cross directory boundaries
import { logger } from "@/lib/logger";
import { cn } from "@/utils/cn";
import { registerUser } from "@/services/auth";

// Direct imports preferred over barrel imports for tree-shaking
import { logger } from "@/lib/logger";    // PREFERRED
import { logger } from "@/lib";           // ACCEPTABLE (barrel re-exports)

// Barrel exports exist in: lib/, utils/, services/, types/
// Do NOT add barrel exports to: components/, hooks/, constants/
```

### 3.4 Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Files (components) | kebab-case | `login-form.tsx` |
| Files (lib/services) | kebab-case | `api-error.ts`, `rate-limit.ts` |
| Files (tests) | `<module>.test.ts(x)` | `health.test.ts`, `login-form.test.tsx` |
| Components | PascalCase | `LoginForm`, `DashboardSidebar` |
| Functions | camelCase | `handleApiError`, `checkRateLimit` |
| Constants | UPPER_SNAKE_CASE | `NAV_ITEMS`, `LOG_LEVELS` |
| Types/Interfaces | PascalCase | `ApiError`, `RateLimitOptions` |
| CSS classes | Tailwind utility classes | No custom CSS files; use `cn()` for conditionals |

---

## 4. Server vs Client Boundaries

### 4.1 Server Components (Default)

All components in `src/app/` are server components by default (Next.js App Router convention). Server components:

- Can directly access server-only modules (`@/lib/*`)
- Cannot use hooks, event handlers, or browser APIs
- Do not ship JavaScript to the client

### 4.2 Client Components

Add `"use client"` at the top of the file when the component needs:

- React hooks (`useState`, `useEffect`, `useRouter`)
- Event handlers (`onClick`, `onSubmit`)
- Browser APIs (`window`, `document`)

```typescript
"use client";

import { useState } from "react";
// Client components CANNOT import from @/lib (server-only)
// Client components CAN import from @/utils, @/types, @/constants
```

### 4.3 The Server-Only Guard

All files in `src/lib/` enforce the server-only boundary:

```typescript
// src/lib/index.ts
import "server-only";
export { ApiError, createErrorResponse, handleApiError } from "./api-error";
export { withHttpLogging } from "./api-wrapper";
export { env } from "./env";
export { childLogger, default as logger, logError, logHttp } from "./logger";
export { checkRateLimit, getRateLimiter } from "./rate-limit";
export { requireAuth } from "./requireAuth";
```

If a client component accidentally imports from `@/lib`, the build will fail with a clear error. This is intentional — it prevents server secrets from leaking to the browser.

---

## 5. API Route Pattern

Every API route handler follows the same structure. Do not deviate from this pattern.

### 5.1 Standard Route Template

```typescript
import { NextRequest, NextResponse } from "next/server";
import { withHttpLogging } from "@/lib/api-wrapper";
import { handleApiError } from "@/lib/api-error";
import { requireAuth } from "@/lib/requireAuth";
import { validateBody } from "@/lib/validate-body";
import { checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { someSchema } from "@/types/schemas/some";

export async function POST(request: NextRequest) {
  return withHttpLogging(request, async () => {
    try {
      // 1. Auth check (every protected route must call requireAuth)
      const user = await requireAuth();

      // 2. Rate limiting (public endpoints only — auth endpoints)
      const limited = await checkRateLimit(request, {
        id: "api/example",
        limit: 10,
        windowSecs: 60,
      });
      if (limited) return limited;

      // 3. Parse and validate input with Zod schema
      const body = await validateBody(request, someSchema);

      // 4. Business logic (delegated to services, scoped to user.id)
      const result = await someService(user.id, body);
      logger.info("Operation succeeded", { userId: user.id });
      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      return handleApiError(error);
    }
  });
}
```

For public endpoints (no auth required), skip `requireAuth()` and add a comment explaining why:

```typescript
// No auth check — this is a public endpoint
```

### 5.2 Route Requirements

| Requirement | Detail |
|-------------|--------|
| Call `requireAuth()` | Every protected route — returns authenticated `user`, throws `ApiError(401)` if missing |
| Wrap with `withHttpLogging` | Every handler, no exceptions — logs method, URL, status, duration |
| Rate limit public endpoints | Registration, login, health — use `checkRateLimit` |
| Validate input with `validateBody` | Use `validateBody(request, schema)` with Zod schemas from `@/types/schemas/` |
| Delegate to services | Routes handle HTTP; services handle business logic |
| Use `handleApiError` | Catches `ApiError` and unknown errors consistently |
| Consistent error format | Always return `{ error: string }` on failure |
| Use `logger`, not `console` | Server-side logging only via Winston logger |

---

## 6. Service Layer

Services live in `src/services/` and contain all business logic. They are called by API route handlers but know nothing about HTTP.

### 6.1 Service Conventions

```typescript
// src/services/auth.ts
import { ApiError } from "@/lib/api-error";
import { logger } from "@/lib/logger";

export async function registerUser(email: string, password: string) {
  // Services throw ApiError with the appropriate status code
  // The route handler catches this via handleApiError
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    if (error.message.includes("already registered")) {
      throw new ApiError(409, "Email already registered");
    }
    throw new ApiError(500, "Registration failed");
  }

  logger.info("User registered", { userId: data.user?.id });
  return data;
}
```

### 6.2 Service Rules

| Rule | Detail |
|------|--------|
| Throw `ApiError` for expected failures | `ApiError(409, "Conflict")`, `ApiError(401, "Unauthorized")` |
| Let unexpected errors propagate | `handleApiError` catches them as 500s |
| No HTTP objects | Services never touch `NextRequest` or `NextResponse` |
| Log with `logger` | Use `childLogger("service-name")` for scoped logs |

---

## 7. Error Handling

### 7.1 The ApiError Class

```typescript
// Defined in src/lib/api-error.ts
class ApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string);
}
```

### 7.2 Error Flow

```
Service throws ApiError(409, "Email taken")
  → Route handler catches via handleApiError()
    → Returns NextResponse.json({ error: "Email taken" }, { status: 409 })

Service throws unexpected Error("DB connection lost")
  → handleApiError() logs the real error server-side
    → Returns NextResponse.json({ error: "Internal server error" }, { status: 500 })
```

### 7.3 Error Rules

| Rule | Detail |
|------|--------|
| Never expose internal details | Stack traces, DB errors, config values stay server-side |
| Use correct HTTP status codes | 400 bad input, 401 unauthenticated, 403 forbidden, 404 not found, 409 conflict, 429 rate limited, 500 server error |
| Return `404` not `403` for missing resources | Prevents confirming a resource exists (see security guardrails doc) |
| Always return `{ error: string }` | Consistent format for all error responses |

---

## 8. Logging

### 8.1 Winston Logger

The logger (`src/lib/logger.ts`) is the only approved way to log on the server.

| Level | Use |
|-------|-----|
| `error` | Failures that need attention (unhandled errors, service failures) |
| `warn` | Recoverable issues (rate limit hit, deprecated usage) |
| `info` | Significant events (user registered, job created) |
| `http` | HTTP request/response logging (handled by `withHttpLogging`) |
| `debug` | Development-only detail (variable values, flow tracing) |

### 8.2 Logging Rules

| Rule | Detail |
|------|--------|
| No `console.log` or `console.error` in server code | Use `logger` from `@/lib/logger` |
| Exception: `error.tsx` | Client component — cannot import server logger, uses `console.error` |
| Automatic redaction | Logger strips `password`, `token`, `authorization`, `secret`, `apikey` from output |
| Use child loggers for services | `const log = childLogger("auth")` — prefixes all messages with `[auth]` |
| Structured metadata | Pass objects as second argument: `logger.info("Created", { jobId, userId })` |

### 8.3 Transport Configuration

| Environment | Transports |
|-------------|-----------|
| Development | Console only (colorized) |
| Production | Console + rotating file transports |

Production file transports:

| File | Content | Max Size | Max Files |
|------|---------|----------|-----------|
| `error.log` | Error-level only | 10 MB | 5 |
| `combined.log` | All levels | 10 MB | 10 |
| `exceptions.log` | Uncaught exceptions | — | — |
| `rejections.log` | Unhandled promise rejections | — | — |

---

## 9. Testing Standards

### 9.1 Stack

- **Runner:** Vitest (ESM-native, globals enabled)
- **Environment:** jsdom (browser-like DOM for component tests)
- **Assertions:** Vitest built-in + Testing Library jest-dom matchers
- **Component testing:** React Testing Library (`render`, `screen`, `userEvent`)
- **Coverage:** v8 provider (text, JSON, HTML reporters)

### 9.2 Test File Organization

```
src/tests/
├── __mocks__/                 # Shared mock factories (e.g. server-only mock)
├── api/                       # API route handler tests
│   ├── ai-resume.test.ts
│   ├── documents.test.ts
│   ├── health.test.ts
│   ├── jobs-id.test.ts
│   ├── metrics.test.ts
│   ├── profile.test.ts
│   └── settings.test.ts
├── components/                # Component tests (organized by feature)
│   └── auth/
│       ├── forgot-password-form.test.tsx
│       ├── login-form.test.tsx
│       ├── logout-button.test.tsx
│       ├── register-form.test.tsx
│       └── reset-password-form.test.tsx
├── hooks/                     # Hook tests
│   └── use-view-mode.test.ts
├── lib/                       # Infrastructure tests
│   └── requireAuth.test.ts
├── services/                  # Service tests
│   ├── ai.test.ts
│   ├── documents.test.ts
│   ├── metrics.test.ts
│   ├── prisma.test.ts
│   ├── profile.test.ts
│   ├── settings.test.ts
│   └── to-job-response.test.ts
├── utils/                     # Utility function tests
│   ├── cn.test.ts
│   ├── deadline.test.ts
│   ├── search-jobs.test.ts
│   └── sort-jobs.test.ts
└── setup.ts                   # Test setup (imports jest-dom matchers)
```

Component tests can also live next to the component (e.g., `src/components/auth/login-form.test.tsx`).

### 9.3 Testing Patterns

**API route tests** — mock infrastructure, test HTTP behavior:

```typescript
// Mock server-only dependencies before importing the route
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue(null),
}));
vi.mock("@/lib/api-wrapper", () => ({
  withHttpLogging: vi.fn((_req, handler) => handler()),
}));

import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
  it("returns 200 with status ok", async () => {
    const request = new NextRequest("http://localhost/api/health");
    const response = await GET(request);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe("ok");
  });
});
```

**Component tests** — render, interact, assert:

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./login-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

it("shows error on invalid credentials", async () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    json: () => Promise.resolve({ error: "Invalid credentials" }),
  });

  render(<LoginForm />);
  await userEvent.type(screen.getByLabelText(/email/i), "test@test.com");
  await userEvent.type(screen.getByLabelText(/password/i), "wrong");
  await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

  expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
});
```

**Service tests** — mock external dependencies, test logic:

```typescript
vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn().mockImplementation(() => mockPrismaInstance),
}));

it("returns a singleton instance", async () => {
  const { prisma: first } = await import("@/services/prisma");
  const { prisma: second } = await import("@/services/prisma");
  expect(first).toBe(second);
});
```

### 9.4 Testing Rules

| Rule | Detail |
|------|--------|
| Mock server-only modules | `vi.mock("@/lib/rate-limit")` etc. before importing the module under test |
| Reset mocks between tests | Use `beforeEach(() => vi.clearAllMocks())` |
| Test behavior, not implementation | Assert on outputs and side effects, not internal state |
| No test-only exports | Don't export functions just to test them; test through public interfaces |
| `server-only` is aliased | Vitest config maps `server-only` to an empty mock module |

---

## 10. Database and Prisma

### 10.1 Prisma Client Singleton

```typescript
// src/services/prisma.ts — global singleton prevents connection exhaustion
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

### 10.2 Schema Conventions

| Convention | Detail |
|------------|--------|
| Models in `prisma/schema.prisma` | Single source of truth for the database schema |
| `userId` foreign key | Every user-owned entity references the auth user |
| `onDelete: Cascade` | Deleting a parent removes all children |
| Timestamps | `createdAt` and `updatedAt` on all models |
| Migrations via CLI | `bun run prisma:migrate` to create and apply |
| Regenerate client | `bun run prisma:generate` after any schema change |

### 10.3 Database Rules

| Rule | Detail |
|------|--------|
| No raw SQL | All queries through Prisma typed client |
| No `prisma.$executeRaw` in app code | Use Prisma query builders |
| RLS enforces isolation | Row-level security policies in Supabase (see security guardrails doc) |
| Always scope queries | Include `userId` in `where` clauses even though RLS provides a safety net |

---

## 11. CI/CD Pipeline

### 11.1 GitHub Actions Workflow

The CI pipeline (`.github/workflows/ci.yml`) runs on every pull request and push to `main`.

**Steps in order:**

| Step | Command | Failure = |
|------|---------|-----------|
| Install dependencies | `bun install --frozen-lockfile` | Lockfile mismatch |
| Generate Prisma client | `bun prisma generate` | Schema error |
| Lint | `bun lint` | Biome violations |
| Type check | `bun run type-check` | TypeScript errors |
| Test | `bun run test` | Failing tests |
| Build | `bun run build` | Build errors or warnings |

**Pipeline rules:**

- All steps must pass before a PR can merge
- Timeout: 10 minutes
- Concurrency: new pushes cancel in-progress runs on the same branch
- Uses placeholder env vars for `DATABASE_URL` and Supabase keys (CI does not connect to a real database)

### 11.2 Local Quality Checklist

Run these locally before pushing:

```bash
bun lint              # Biome lint (auto-fixes where possible)
bun run type-check    # tsc --noEmit
bun run test          # Vitest test suite
bun run build         # Next.js production build
```

---

## 12. Git Workflow

### 12.1 Branching

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code. All PRs merge here. |
| Feature branches | Named by ticket: `<ticket-number>-<short-description>` (e.g. `2-001-create-engineering-coding-standards-context-document`) |

### 12.2 Commit Messages

Follow conventional commit format:

```
<type>(<scope>): <description>

Examples:
feat(auth): add email/password registration
fix(api): handle duplicate email on signup
docs(security): add data and security guardrails context document
chore(deps): reinstall dependencies to resolve broken node_modules
test(auth): add login form component tests
```

| Type | Use |
|------|-----|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `chore` | Maintenance, dependency updates |
| `test` | Adding or updating tests |
| `refactor` | Code restructuring with no behavior change |
| `style` | Formatting, whitespace (should be caught by Biome) |

### 12.3 Pull Request Requirements

- PR title should be descriptive and reference the ticket number
- All CI checks must pass (lint, type-check, test, build)
- At least one approving review before merge
- No direct pushes to `main`

---

## 13. Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-04-01 | Ethan Yucetepe | Initial version |
| 2026-04-14 | Justin Cordova | Updated to reflect current codebase: route groups, all services/lib/utils/types files, requireAuth/validateBody patterns, Prisma v6, accurate test file listing, barrel export rules |
