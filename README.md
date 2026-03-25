# Next.js Bun Starter

A production-ready Next.js 16 starter with Bun, TypeScript, Tailwind CSS v4, and batteries included.

---

## What's Inside

### Stack

| Layer                | Choice                                            |
| -------------------- | ------------------------------------------------- |
| Runtime (dev/build)  | Bun                                               |
| Runtime (production) | Node 22 Alpine (Docker)                           |
| Framework            | Next.js 16 — App Router, React 19, React Compiler |
| Language             | TypeScript strict mode, ES2022 target             |
| Styles               | Tailwind CSS v4 with `@theme` API                 |
| Testing              | Vitest + Testing Library + jsdom                  |
| Linting/Formatting   | Biome                                             |

### Infrastructure (`src/lib/` — server-only)

All files in `src/lib/` import `"server-only"` and are safe to use exclusively in server components and API routes.

| File             | What it does                                                                                                                                                                                                                                                                                                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `env.ts`         | Validates environment variables with Zod v4 at startup. The app exits with a clear error if any variable is invalid.                                                                                                                                                                                                                                  |
| `logger.ts`      | Winston logger. Pretty console output in development, structured JSON to files in production. Automatically redacts sensitive keys (`password`, `token`, `authorization`, `secret`, `apikey`) in all log output. Exports `childLogger(service)`, `logError`, and `logHttp` helpers.                                                                   |
| `api-error.ts`   | `ApiError` class (status code + message), `handleApiError` (converts unknown errors to `NextResponse`), and `createErrorResponse` factory.                                                                                                                                                                                                            |
| `api-wrapper.ts` | `withHttpLogging` — wraps a route handler and logs method, URL, status, and duration via `logHttp`.                                                                                                                                                                                                                                                   |
| `rate-limit.ts`  | Per-route in-memory rate limiting via `rate-limiter-flexible`. Limiter instances are cached by ID. Returns a `429` response with `Retry-After` and `X-RateLimit-*` headers when the limit is exceeded. For multi-instance deployments (Vercel, clustered Node), swap `RateLimiterMemory` for `RateLimiterRedis` — the swap is documented in the file. |
| `index.ts`       | Barrel export. Has `import "server-only"` at the top so any import from `@/lib` is server-guarded.                                                                                                                                                                                                                                                    |


#### Usage Examples

**Environment validation:**
```typescript
import { env } from "@/lib/env";

// Access validated environment variables
console.log(env.NEXT_PUBLIC_APP_URL);
console.log(env.LOG_LEVEL);
```

**Logging:**
```typescript
import { logger, logError, logHttp } from "@/lib/logger";

// Basic logging
logger.info("User logged in", { userId: "123" });
logger.warn("Rate limit approaching", { ip: "1.2.3.4" });

// Error logging with stack trace
logError("Database connection failed", new Error("Connection timeout"));

// HTTP request/response logging
logHttp("GET", "/api/users", 200, 125); // method, url, status, duration (ms)
```

**Child logger for services:**
```typescript
import { childLogger } from "@/lib/logger";

const userLogger = childLogger("userService");
userLogger.debug("Fetching user", { userId: "456" });
```

**API error handling:**
```typescript
import { ApiError, handleApiError } from "@/lib/api-error";

// Throw API errors with status codes
if (!user) {
  throw new ApiError(404, "User not found");
}

// Handle unknown errors in routes
export async function GET() {
  try {
    const data = await fetchData();
    return Response.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}
```

**HTTP logging wrapper:**
```typescript
import { withHttpLogging } from "@/lib/api-wrapper";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return withHttpLogging(request, async () => {
    const data = await fetchData();
    return Response.json(data);
  });
}
```

**Rate limiting:**
```typescript
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const limitResponse = await checkRateLimit({
    id: "api-users", // unique identifier per route
    limit: 100,      // requests
    window: 60000,   // milliseconds
    request,
  });

  if (limitResponse) {
    return limitResponse; // 429 with Retry-After header
  }

  // Proceed with request
  const data = await fetchData();
  return Response.json(data);
}
```
### Utilities (`src/utils/`)

| File    | What it does                                                                                                              |
| ------- | ------------------------------------------------------------------------------------------------------------------------- |
| `cn.ts` | Combines `clsx` + `tailwind-merge` into a single `cn(...classes)` helper for conditional and conflict-free class merging. |


#### Usage Example

```typescript
import { cn } from "@/utils/cn";

const button = cn(
  "px-4 py-2 rounded font-medium",
  isPrimary && "bg-blue-500 text-white",
  isDisabled && "opacity-50 cursor-not-allowed",
  className
);
```
### App Pages (`src/app/`)

| File                  | What it does                                                                                                                                                |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `layout.tsx`          | Root layout. Loads Geist Mono font, sets `metadataBase` from `NEXT_PUBLIC_APP_URL`, applies `font-mono antialiased` globally.                               |
| `page.tsx`            | Starter demo page — replace with your own content.                                                                                                          |
| `error.tsx`           | App Router error boundary (`"use client"`). Logs to console (replace with Sentry or similar in production).                                                 |
| `loading.tsx`         | Global loading skeleton — a centered spinner.                                                                                                               |
| `not-found.tsx`       | 404 page with a link back to home.                                                                                                                          |
| `globals.css`         | Tailwind v4 import + `@theme` block defining `--color-background` and `--font-mono`.                                                                        |
| `api/health/route.ts` | `GET /api/health` — returns `{ status: "ok", timestamp }`. Used as the Docker health check endpoint. Demonstrates rate limiting + HTTP logging integration. |

### Middleware

`src/proxy.ts` — Next.js 16 middleware (replaces `middleware.ts`). Currently a pass-through placeholder. Add auth checks, redirects, or custom headers here. Security headers are applied globally in `next.config.ts`, not here.

> **Note:** The matcher excludes `/api/*` routes. API routes handle their own auth and rate limiting. Remove `api|` from the matcher if you need middleware on API routes.

### Configuration

| File                  | Purpose                                                                                                                           |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `next.config.ts`      | Standalone output, React Compiler enabled, security headers applied to all routes via `headers()`.                                |
| `tsconfig.json`       | Strict mode, ES2022 target, `@/` path alias pointing to `src/`.                                                                   |
| `vitest.config.ts`    | jsdom environment, `@/` alias, `server-only` mock (required since Vitest doesn't activate the `react-server` conditional export). |
| `biome.json`      | Biome configuration for linting and formatting.

### Security Headers (applied globally via `next.config.ts`)

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy` — `unsafe-inline` allowed for styles and scripts (required by Next.js critical CSS/script injection)
- `Permissions-Policy` — camera, microphone, geolocation disabled

### Docker

Multi-stage build: Bun 1.2 installs and builds, Node 22 Alpine runs. Standalone output makes the image self-contained. Non-root user (`nextjs:nodejs`, uid/gid 1001). `docker-compose.yml` includes a health check against `/api/health`.

### Git Hooks

Husky runs `lint-staged` on every commit: Biome on `.ts`/`.tsx`, `.js`, `.json`, `.css`, `.md`.

---

## Quick Start (using this repo directly)

```bash
git clone <this-repo> my-project
cd my-project
bun install
cp .env.example .env.local
bun dev
```

Open [http://localhost:3000](http://localhost:3000). Replace `src/app/page.tsx` with your own content and build from there.

---

## Start from Scratch

Use this section if you want to set up an equivalent project manually instead of cloning.

### 1. Create the Next.js project

```bash
npx create-next-app@latest my-project --typescript --eslint --app --src-dir --import-alias "@/*"
cd my-project
```

### 2. Install runtime dependencies

```bash
bun add winston rate-limiter-flexible tailwind-merge clsx zod
```

### 3. Install dev dependencies

```bash
bun add -d prettier husky lint-staged vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @vitest/coverage-v8 jsdom babel-plugin-react-compiler
```

> `server-only` does not need to be installed — Next.js/Turbopack provides it as a virtual module at build time. The Vitest mock in `src/tests/__mocks__/server-only.ts` handles it for tests.

### 4. Ensure Tailwind CSS v4

`create-next-app@latest` with Next.js 16 should scaffold Tailwind v4 already. Verify:

```bash
bun pm ls | grep tailwindcss   # should show tailwindcss@^4
```

If you see Tailwind v3, upgrade it:

```bash
bun remove tailwindcss postcss autoprefixer
bun add -d tailwindcss@^4 @tailwindcss/postcss
rm -f tailwind.config.ts tailwind.config.js
```

Your `postcss.config.mjs` should contain only:

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

Do not add `autoprefixer` or `postcss-import` — Tailwind v4 handles both automatically.

### 5. Create the directory structure

```bash
mkdir -p src/components src/hooks src/services src/types src/constants src/lib src/utils src/tests/__mocks__ src/tests/utils src/tests/api src/app/api/health
touch src/components/index.ts src/hooks/index.ts src/services/index.ts src/types/index.ts src/constants/index.ts
```

### 6. Update `package.json`

Add the following to your `package.json`. The `scripts` block replaces the generated one; merge if you have custom entries:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "biome check --write .",
    "format": "biome format --write .",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "prepare": "husky"
  },
  "lint-staged": {
    "*": ["biome check --write --no-errors-on-unmatched"]
  }
}
```

### 7. Initialize Husky

```bash
bunx husky init
echo "bunx lint-staged" > .husky/pre-commit
```

### 8. Copy these files from this starter

Copy the following files verbatim — they require no project-specific changes:

**Configuration:**

- `biome.json`
- `vitest.config.ts`

**Next.js config** — replace the generated `next.config.ts`:

- `next.config.ts`

**TypeScript config** — update `tsconfig.json` to match this repo's version (adds `@/*` alias, sets `target: "ES2022"`, adds `incremental: true`).

**Server infrastructure** (copy the entire directory):

- `src/lib/env.ts`
- `src/lib/logger.ts`
- `src/lib/api-error.ts`
- `src/lib/api-wrapper.ts`
- `src/lib/rate-limit.ts`
- `src/lib/index.ts`

**Utilities:**

- `src/utils/cn.ts`
- `src/utils/index.ts`

**Middleware:**

- `src/proxy.ts`

**App shell** (replace the generated files):

- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/app/error.tsx`
- `src/app/loading.tsx`
- `src/app/not-found.tsx`

**API route:**

- `src/app/api/health/route.ts`

**Test infrastructure:**

- `src/tests/setup.ts`
- `src/tests/__mocks__/server-only.ts`
- `src/tests/utils/cn.test.ts`
- `src/tests/api/health.test.ts`

**Environment:**

- `.env.example` → copy and also run `cp .env.example .env.local`

**Delete** the generated `src/app/page.tsx` content and replace with your own, or copy this starter's demo page as a reference.

### 9. Verify the setup

```bash
bun run type-check   # tsc --noEmit should pass with 0 errors
bun lint             # Biome lint should pass
bun run test         # All tests should pass
bun run build        # Build should complete with no warnings
```

---

## Project Structure

```
src/
├── app/                  Next.js App Router pages and layouts
│   └── api/              API route handlers
├── lib/                  Server-only infrastructure
│   ├── env.ts            Zod environment validation
│   ├── logger.ts         Winston logger
│   ├── api-wrapper.ts    HTTP request logging middleware
│   ├── api-error.ts      Standardized API error responses
│   └── rate-limit.ts     Per-route rate limiting
├── components/           React components
├── hooks/                Custom React hooks
├── services/             Business logic / external API clients
├── types/                TypeScript type definitions
├── constants/            App-wide constants
├── utils/                Shared utilities (cn, etc.)
├── tests/                Test files and setup
└── proxy.ts              Next.js middleware
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

| Variable              | Description                                            | Default                       |
| --------------------- | ------------------------------------------------------ | ----------------------------- |
| `NODE_ENV`            | Environment mode                                       | `development`                 |
| `LOG_LEVEL`           | Logger verbosity                                       | `debug` (dev) / `info` (prod) |
| `LOG_DIR`             | Directory for log files (production)                   | `logs`                        |
| `NEXT_PUBLIC_APP_URL` | Public-facing application URL — used as `metadataBase` | `http://localhost:3000`       |

Variables are validated at startup with Zod. The app exits with a clear error message if any variable is missing or invalid.

---

## Scripts

| Script                  | Description                    |
| ----------------------- | ------------------------------ |
| `bun dev`               | Start development server       |
| `bun run build`         | Build for production           |
| `bun start`             | Start production server        |
| `bun lint`              | Run Biome lint                     |
| `bun run format`        | Format files with Biome     |
| `bun run type-check`    | TypeScript type checking       |
| `bun run test`          | Run tests once                 |
| `bun run test:ui`       | Run tests with interactive UI  |
| `bun run test:coverage` | Run tests with coverage report |

---

## Docker

```bash
docker compose up
```

Multi-stage build: Bun 1.2 for install/build, Node 22 Alpine for runtime. Standalone output, non-root user (`nextjs:nodejs`), health-checked via `GET /api/health`.

> Log files are written inside the container to `$LOG_DIR` (default: `/app/logs`). Add a volume mount to `docker-compose.yml` if you need logs to persist across restarts.

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Bun Documentation](https://bun.sh)
- [Vitest Documentation](https://vitest.dev)
- [Zod Documentation](https://zod.dev)
- [Tailwind CSS v4](https://tailwindcss.com/docs/v4-beta)
- [Winston](https://github.com/winstonjs/winston)
