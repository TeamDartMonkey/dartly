# Dartly Repository Guide

A comprehensive guide for the team on using the Dartly Next.js 16 + Bun + TypeScript codebase.

## Installing Bun

This project uses **Bun** as the package manager and runtime.

### macOS

```bash
# Using curl (recommended)
curl -fsSL https://bun.sh/install | bash

# Using Homebrew
brew install oven-sh/bun/bun

# Verify installation
bun --version
```

### Windows

```bash
# Using PowerShell (recommended)
powershell -c "irm bun.sh/install.ps1|iex"

# Using winget
winget install oven-sh.bun

# Verify installation
bun --version
```

**After installing Bun, restart your terminal** to ensure the `bun` command is available in your PATH.

### Alternative Package Managers

If you prefer to use npm or pnpm instead of Bun:

```bash
# Install dependencies with npm
npm install

# Install dependencies with pnpm
pnpm install

# Use npm/pnpm commands for all scripts
npm run dev
# or
pnpm run dev
```

---

## Quick Start

```bash
# Install dependencies (after installing Bun)
bun install

# Start development server
bun run dev

# Run tests
bun run test

# Build for production
bun run build
```

---

## Project Structure

```
dartly/
├── .claude/              # Claude AI configuration
├── .husky/               # Git hooks (pre-commit)
├── .next/                # Next.js build output (generated)
├── docs/                 # Documentation
├── logs/                 # Application logs
├── node_modules/         # Dependencies
├── public/               # Static assets (images, fonts, etc.)
├── src/                  # Source code
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore rules
├── biome.json            # Biome linting/formatting config
├── bun.lockb             # Bun lock file
├── next.config.ts        # Next.js configuration
├── package.json          # Dependencies and scripts
├── postcss.config.mjs    # PostCSS config (Tailwind)
├── tsconfig.json         # TypeScript config
└── vitest.config.ts      # Vitest test config
```

---

## Source Code Structure (`src/`)

The `src/` directory contains all application code:

```
src/
├── app/                  # Next.js App Router (pages + layouts)
├── components/           # React components
├── constants/            # App-wide constants
├── hooks/                # Custom React hooks
├── lib/                  # Server-only utilities
├── proxy.ts              # Next.js middleware
├── scripts/              # Utility scripts
├── services/             # Business logic, API clients
├── tests/                # Test setup and mocks
├── types/                # TypeScript type definitions
└── utils/                # Client/server shared utilities
```

---

## Where Pages Go (`src/app/`)

**Next.js uses the App Router** - pages are defined by file structure in `src/app/`.

### Routing Rules

- Each folder becomes a route segment
- `page.tsx` = route UI
- `layout.tsx` = shared UI (surrounds pages)
- `loading.tsx` = loading state
- `error.tsx` = error boundary
- `not-found.tsx` = 404 page
- `api/` = API routes

### Examples

```
src/app/
├── page.tsx              # → / (home page)
├── about/
│   └── page.tsx          # → /about
├── dashboard/
│   ├── page.tsx          # → /dashboard
│   ├── layout.tsx        # Layout for all dashboard routes
│   └── settings/
│       └── page.tsx      # → /dashboard/settings
├── api/
│   ├── users/
│   │   └── route.ts      # → /api/users (GET, POST, etc.)
│   └── auth/
│       └── route.ts      # → /api/auth
├── layout.tsx            # Root layout (applies to all pages)
├── globals.css           # Global styles
├── loading.tsx           # Root loading state
├── error.tsx             # Root error boundary
└── not-found.tsx         # Root 404 page
```

### Creating a New Page

1. Create a folder in `src/app/` (e.g., `src/app/profile/`)
2. Add a `page.tsx` file:
   ```tsx
   export default function ProfilePage() {
     return <div>Profile Page</div>;
   }
   ```
3. Navigate to `/profile`

### API Routes

Create `route.ts` in `src/app/api/`:

```ts
// src/app/api/users/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ users: [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  // Handle POST
  return NextResponse.json({ success: true }, { status: 201 });
}
```

---

## Where Components Go (`src/components/`)

**Two types of components:**

### 1. UI Components
Reusable, presentational components (buttons, cards, modals, etc.)

```
src/components/ui/
├── button.tsx
├── card.tsx
├── input.tsx
└── modal.tsx
```

### 2. Feature Components
Domain-specific components tied to features

```
src/components/dashboard/
├── job-card.tsx
└── stats-panel.tsx
```

### Component Example

```tsx
// src/components/ui/button.tsx
import { cn } from "@/utils/cn";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}

export function Button({ children, variant = "primary", className }: ButtonProps) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded",
        variant === "primary" && "bg-blue-500 text-white",
        className
      )}
    >
      {children}
    </button>
  );
}
```

**Use components in pages:**

```tsx
import { Button } from "@/components/ui/button";

export default function Page() {
  return <Button variant="primary">Click me</Button>;
}
```

---

## Lib vs Utils vs Services

### `src/lib/` - Server-Only Utilities
⚠️ **ALL files here use `"server-only"`** - cannot be imported in client components.

Contains:
- **Logging** (`logger.ts`) - Winston logger for server logs
- **Environment** (`env.ts`) - Type-safe environment variables
- **Rate limiting** (`rate-limit.ts`) - In-memory rate limiter
- **API helpers** (`api-error.ts`, `api-wrapper.ts`) - Error handling and logging middleware

**Barrel export** (`src/lib/index.ts`):
```ts
import "server-only";
export { logger, logError } from "./logger";
export { env } from "./env";
// ...
```

### `src/utils/` - Shared Utilities
Safe for **both client and server**.

Contains:
- `cn()` - Tailwind class merger (clsx + tailwind-merge)
- Date formatters
- Validators
- Formatters that don't rely on server-only features

### `src/services/` - Business Logic
Contains:
- Database clients (Supabase, Prisma)
- External API integrations
- AI service clients
- Complex business operations

**Example:**

```ts
// src/services/supabase.ts
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
```

---

## Linting and Formatting (Biome)

**Biome** is used for both linting and formatting (all-in-one tool).

### Configuration

Defined in `biome.json`:
- 2-space indentation
- 100 character line width
- Double quotes
- Semicolons required
- Automatic import organization

### Commands

```bash
# Check for issues
bun lint

# Fix issues (auto-fixes where possible)
bun lint

# Format code
bun run format
```

### Pre-Commit Hooks

**Husky + lint-staged** automatically lint/format files on commit:
- Runs `biome check --write` on staged `.ts`, `.tsx`, `.js`, `.jsx`, `.json` files
- Blocks commits if linting fails

### Common Biome Rules

- `noUnusedVariables` - Warns about unused variables
- `noUnusedImports` - Warns about unused imports
- `recommended` - Enables all recommended rules

---

## Testing (Vitest)

**Vitest** + **Testing Library** + **jsdom** for React component testing.

### Configuration

`vitest.config.ts`:
- Environment: `jsdom` (browser-like DOM)
- Setup file: `src/tests/setup.ts`
- Path alias: `@/*` → `src/*`
- `server-only` mock for testing server components
- Coverage: `v8` provider with text/json/html reporters

### Commands

```bash
# Run all tests
bun run test

# Run tests with UI (interactive)
bun run test:ui

# Run tests with coverage report
bun run test:coverage
```

### Test Location

Tests should be:
- **Co-located**: Next to the file they test (e.g., `button.tsx.test.tsx`)
- **Or** in `src/tests/` organized by module

### Test Example

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("applies primary variant styles", () => {
    render(<Button variant="primary">Primary</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-blue-500");
  });
});
```

### Test Setup

`src/tests/setup.ts`:
- Imports `@testing-library/jest-dom` for custom matchers
- Provides globals (`describe`, `it`, `expect`, etc.)

---

## Environment Variables

### Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your values to `.env.local` (never commit `.env.local`)

### Available Variables

```bash
# App
NODE_ENV=development
LOG_LEVEL=info
LOG_DIR=logs
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://...

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Using Environment Variables

```ts
// Server-side
import { env } from "@/lib/env";

export async function GET() {
  const appUrl = env.NEXT_PUBLIC_APP_URL;
  // ...
}

// Client-side
export default function Component() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  // ...
}
```

**Important:**
- `NEXT_PUBLIC_*` variables are exposed to the browser
- Other variables are server-only

---

## TypeScript Path Aliases

**Path alias configured** in `tsconfig.json`:
- `@/` → `src/`

### Usage

```tsx
// Instead of:
import { Button } from "../../../components/ui/button";
import { logger } from "../../../../lib/logger";

// Use:
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";
```

---

## Scripts and Commands

All scripts defined in `package.json`:

| Command | Description |
|---------|-------------|
| `bun dev` | Start development server on `:3000` |
| `bun run build` | Build for production |
| `bun start` | Start production server |
| `bun lint` | Run Biome linter (with auto-fix) |
| `bun run format` | Run Biome formatter |
| `bun run type-check` | TypeScript type checking |
| `bun run test` | Run Vitest tests |
| `bun run test:ui` | Run Vitest UI (interactive) |
| `bun run test:coverage` | Run tests with coverage report |

**Prisma commands:**
| Command | Description |
|---------|-------------|
| `bun run prisma:migrate` | Create and apply Prisma migrations |
| `bun run prisma:generate` | Regenerate Prisma client after schema changes |
| `bun run prisma:studio` | Open Prisma Studio for DB inspection |

---

## Styling (Tailwind CSS v4)

Tailwind v4 with PostCSS plugin (`@tailwindcss/postcss`).

### Configuration

`postcss.config.mjs`:
```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

### Using Tailwind

```tsx
import { cn } from "@/utils/cn";

export default function Component() {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold">Title</h2>
      <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Action
      </button>
    </div>
  );
}
```

### Utility: `cn()`

Merges Tailwind classes intelligently:
```ts
import { cn } from "@/utils/cn";

cn("px-4 py-2", isActive && "bg-blue-500", className);
```

---

## Middleware (`src/proxy.ts`)

**Next.js middleware** for:
- Authentication checks
- Route protection
- Request/response modification

Example pattern:
```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check auth, redirect, etc.
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/protected/:path*"],
};
```

---

## Key Conventions

### File Organization

- **`src/lib/`** - Server-only only (always imports `"server-only"`)
- **`src/utils/`** - Shared (client + server safe)
- **`src/services/`** - Business logic and external clients
- **`src/components/`** - React components
  - `components/ui/` - Reusable UI components
  - `components/[feature]/` - Feature-specific components
- **`src/app/`** - Next.js App Router (pages, layouts, API routes)

### Barrel Exports

**These files have barrel exports:**
- `src/lib/index.ts` - Exports all lib utilities
- `src/utils/index.ts` - Exports all utilities
- `src/services/index.ts` - Exports all services
- `src/types/index.ts` - Exports all types
- `src/constants/index.ts` - Exports all constants

**These are empty (git placeholders only):**
- `src/components/index.ts` - Do NOT add exports
- `src/hooks/index.ts` - Do NOT add exports

### Import Style

- Prefer direct imports over barrel imports for tree-shaking
- Exception: Barrel exports from `lib/`, `utils/`, `services/`, `types/`, `constants/`
- Use path alias `@/` for all internal imports

### Logging

- **Server code**: Use `logger` from `@/lib/logger`
- **Client code**: `console.log` / `console.error` is acceptable
- **Never** use `console.log` in server code

### API Responses

- Use `handleApiError` from `@/lib/api-error` for consistent error responses
- Use `withHttpLogging` from `@/lib/api-wrapper` to log all requests/responses
- Response format: `{ error: string }` for errors

### Security

- Environment variables defined in `next.config.ts` headers, not middleware
- All public API routes should use `checkRateLimit` from `@/lib/rate-limit`
- Session management via Supabase Auth (email/password)
- Row-level security (RLS) policies in Supabase for data isolation

---

## Development Workflow

### 1. Start Development Server

```bash
bun run dev
```

Server runs on `http://localhost:3000`

### 2. Make Changes

- Edit files in `src/`
- Hot module reload automatically updates
- Lint/format automatically on commit

### 3. Run Tests

```bash
bun run test
```

### 4. Type Check

```bash
bun run type-check
```

### 5. Build

```bash
bun run build
```

---

## Troubleshooting

### Build Fails

```bash
# Check types
bun run type-check

# Check lint
bun lint

# Check tests
bun run test
```

### Import Errors

- Ensure you're using `@/` path alias
- Check that the file exists and is properly exported
- Remember: `src/lib/` files cannot be imported in client components

### Lint Errors

```bash
# Auto-fix most issues
bun lint

# Or manually fix based on error messages
```

### Test Failures

```bash
# Run tests in watch mode
bun run test:ui

# Run with coverage to see what's tested
bun run test:coverage
```

---

## Additional Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Biome Docs**: https://biomejs.dev/
- **Vitest Docs**: https://vitest.dev/
- **Tailwind CSS Docs**: https://tailwindcss.com/
- **Testing Library Docs**: https://testing-library.com/
- **Bun Docs**: https://bun.sh/

---

## Team Guidelines

### Git Workflow

- **Branch** from `main` for features
- **Commit** task-scoped changes (use pre-commit hooks)
- **Push** and create **Pull Request**
- **CI/CD** runs automatically (type-check, lint, test)
- **Merge** only after all checks pass

### Code Review Checklist

- [ ] Build passes (`bun run build`)
- [ ] Tests pass (`bun run test`)
- [ ] Type-check passes (`bun run type-check`)
- [ ] Lint passes (`bun lint`)
- [ ] No console.logs in server code
- [ ] Environment variables documented in `.env.example`
- [ ] New components have tests (if non-trivial)

---

## Architecture Decisions (Locked)

These choices are final. Do not suggest alternatives.

| Component      | Choice               | Rationale                                      |
| -------------- | -------------------- | ---------------------------------------------- |
| Backend        | Supabase + Prisma    | Managed PostgreSQL with auth and real-time    |
| Database       | PostgreSQL           | Relational DB, Supabase-managed                |
| ORM            | Prisma               | Type-safe queries, excellent DX                |
| Auth           | Supabase Auth (email/password) | Built-in auth with email/password registration; OAuth to be added |
| CSS            | Tailwind CSS v4      | PostCSS plugin for modern setup                |
| Testing        | Vitest               | Fast, ESM-native, React 19 compatible          |
| Linting        | Biome                | All-in-one linter + formatter                  |
| CI/CD          | GitHub Actions       | Automated build, test, lint, deploy            |
| Deployment     | Vercel               | Edge deployment, preview URLs, auto SSL        |

---
