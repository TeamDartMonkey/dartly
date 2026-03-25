# Prisma Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install Prisma with Auth.js adapter, define the full application schema, wire up the Prisma client singleton, and update project docs.

**Architecture:** Auth.js v5 manages OAuth sessions and owns the User/Account/Session/VerificationToken models via the Prisma adapter. All app models (Profile, Job, Document, etc.) carry a `userId` string that references `User.id`. The Prisma client is a singleton in `src/services/prisma.ts` and re-exported from the services barrel.

**Tech Stack:** Prisma 6, `@prisma/client`, `next-auth@beta` (Auth.js v5), `@auth/prisma-adapter`, Supabase PostgreSQL

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `prisma/schema.prisma` | Full DB schema — datasource, generator, all models |
| Create | `src/services/prisma.ts` | PrismaClient singleton |
| Create | `src/tests/services/prisma.test.ts` | Unit tests for singleton |
| Modify | `src/services/index.ts` | Re-export prisma client |
| Modify | `src/lib/env.ts` | Add DATABASE_URL, AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET |
| Modify | `package.json` | Add prisma scripts + postinstall |
| Modify | `.env.example` | Document new env vars |
| Modify | `docs/DARTLY_REPO_GUIDE.md` | Update env vars table and scripts section |

---

## Task 1: Create branch

**Files:** none

- [ ] **Step 1: Create and switch to the feature branch**

```bash
git checkout -b chore/prisma-setup
```

Expected output: `Switched to a new branch 'chore/prisma-setup'`

---

## Task 2: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install Prisma packages**

```bash
bun add @prisma/client @auth/prisma-adapter next-auth@beta
bun add -d prisma
```

- [ ] **Step 2: Verify packages appear in package.json**

```bash
grep -E "prisma|next-auth|auth/prisma" package.json
```

Expected: `@prisma/client`, `prisma`, `@auth/prisma-adapter`, and `next-auth` are listed.

---

## Task 3: Scaffold Prisma and write the schema

**Files:**
- Create: `prisma/schema.prisma`

- [ ] **Step 1: Initialize Prisma**

```bash
bunx prisma init --datasource-provider postgresql
```

This creates `prisma/schema.prisma` and appends `DATABASE_URL` to `.env`. Remove the `.env` entry — we use `.env.local`.

- [ ] **Step 2: Replace `prisma/schema.prisma` with the full schema**

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ---------------------------------------------------------------------------
// Auth.js adapter models — do not modify field names or types
// ---------------------------------------------------------------------------

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts  Account[]
  sessions  Session[]
  profile   Profile?
  jobs      Job[]
  documents Document[]
}

model Account {
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([provider, providerAccountId])
}

model Session {
  sessionToken String   @unique
  userId       String
  expires      DateTime
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String
  expires    DateTime

  @@id([identifier, token])
}

// ---------------------------------------------------------------------------
// App models
// ---------------------------------------------------------------------------

model Profile {
  id                  String   @id @default(cuid())
  userId              String   @unique
  firstName           String?
  lastName            String?
  email               String?
  phone               String?
  location            String?
  professionalLinks   Json?
  headline            String?
  summary             String?
  targetRoles         String[]
  targetLocations     String[]
  workModePreference  String?
  salaryPreference    Int?
  completionStatus    Int      @default(0)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  experiences Experience[]
  educations  Education[]
  skills      Skill[]
}

model Experience {
  id           String         @id @default(cuid())
  profileId    String
  type         ExperienceType
  title        String
  organization String?
  startDate    DateTime?
  endDate      DateTime?
  isCurrent    Boolean        @default(false)
  description  String?
  bullets      String[]
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  profile Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)
}

model Education {
  id           String    @id @default(cuid())
  profileId    String
  institution  String
  degree       String?
  fieldOfStudy String?
  startDate    DateTime?
  endDate      DateTime?
  gpa          String?
  honors       String?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  profile Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)
}

model Skill {
  id          String   @id @default(cuid())
  profileId   String
  name        String
  category    String?
  proficiency String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  profile Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)
}

model Job {
  id               String    @id @default(cuid())
  userId           String
  title            String
  company          String
  location         String?
  description      String?
  compensationNotes String?
  applicationDate  DateTime?
  stage            JobStage  @default(INTERESTED)
  priority         Boolean   @default(false)
  deadline         DateTime?
  recruiterNotes   String?
  customNotes      String?
  lastActivityAt   DateTime?
  outcomeAt        DateTime?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  user             User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  stageHistory     JobStageHistory[]
  activities       JobActivity[]
  documentLinks    JobDocumentLink[]
}

model JobStageHistory {
  id        String    @id @default(cuid())
  jobId     String
  fromStage JobStage?
  toStage   JobStage
  changedAt DateTime  @default(now())

  job Job @relation(fields: [jobId], references: [id], onDelete: Cascade)
}

model JobActivity {
  id          String    @id @default(cuid())
  jobId       String
  type        String
  title       String
  description String?
  scheduledAt DateTime?
  roundType   String?
  completed   Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  job Job @relation(fields: [jobId], references: [id], onDelete: Cascade)
}

model Document {
  id        String         @id @default(cuid())
  userId    String
  type      DocumentType
  name      String
  category  String?
  status    DocumentStatus @default(DRAFT)
  isDeleted Boolean        @default(false)
  deletedAt DateTime?
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt

  user          User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  versions      DocumentVersion[]
  jobLinks      JobDocumentLink[]
}

model DocumentVersion {
  id            String   @id @default(cuid())
  documentId    String
  versionNumber Int
  content       String?
  fileUrl       String?
  createdAt     DateTime @default(now())

  document  Document          @relation(fields: [documentId], references: [id], onDelete: Cascade)
  jobLinks  JobDocumentLink[]
}

model JobDocumentLink {
  id                String   @id @default(cuid())
  jobId             String
  documentId        String
  documentVersionId String
  linkedAt          DateTime @default(now())

  job             Job             @relation(fields: [jobId], references: [id], onDelete: Cascade)
  document        Document        @relation(fields: [documentId], references: [id], onDelete: Cascade)
  documentVersion DocumentVersion @relation(fields: [documentVersionId], references: [id], onDelete: Cascade)

  @@unique([jobId, documentVersionId])
}

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

enum JobStage {
  INTERESTED
  APPLIED
  INTERVIEW
  OFFER
  REJECTED
  ARCHIVED
}

enum ExperienceType {
  EMPLOYMENT
  PROJECT
}

enum DocumentType {
  RESUME
  COVER_LETTER
  OTHER
}

enum DocumentStatus {
  DRAFT
  READY
  ARCHIVED
}
```

- [ ] **Step 3: Verify the schema parses without errors**

```bash
bunx prisma validate
```

Expected: `The schema at prisma/schema.prisma is valid`

---

## Task 4: Update env.ts with new variables

**Files:**
- Modify: `src/lib/env.ts`

- [ ] **Step 1: Add new variables to the env schema**

In `src/lib/env.ts`, update `envSchema` to add the 5 new vars:

```ts
import "server-only";
import { z } from "zod/v4";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.enum(["error", "warn", "info", "http", "debug"]).optional(),
  LOG_DIR: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.url().optional(),
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(1),
  AUTH_GOOGLE_ID: z.string().min(1),
  AUTH_GOOGLE_SECRET: z.string().min(1),
});

function parseEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    process.stderr.write("Invalid environment variables:\n");
    process.stderr.write(`${z.prettifyError(result.error)}\n`);
    process.exit(1);
  }

  return result.data;
}

export const env = parseEnv();
```

- [ ] **Step 2: Run type-check to confirm no type errors**

```bash
bun run type-check
```

Expected: no errors (note: env validation will fail at runtime without real values, but type-check is static)

---

## Task 5: Write the Prisma client singleton (TDD)

**Files:**
- Create: `src/tests/services/prisma.test.ts`
- Create: `src/services/prisma.ts`

- [ ] **Step 1: Write the failing test**

Create `src/tests/services/prisma.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrismaInstance = {
  $connect: vi.fn(),
  $disconnect: vi.fn(),
};

vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn(() => mockPrismaInstance),
}));

describe("prisma singleton", () => {
  beforeEach(() => {
    vi.resetModules();
    // Clear the global to test fresh singleton behavior
    (globalThis as Record<string, unknown>).prisma = undefined;
  });

  it("exports a defined prisma instance", async () => {
    const { prisma } = await import("@/services/prisma");
    expect(prisma).toBeDefined();
  });

  it("reuses the same instance on repeated imports", async () => {
    const { prisma: a } = await import("@/services/prisma");
    const { prisma: b } = await import("@/services/prisma");
    expect(a).toBe(b);
  });

  it("stores the instance on globalThis in non-production", async () => {
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "development",
      writable: true,
    });

    const { prisma } = await import("@/services/prisma");
    expect((globalThis as Record<string, unknown>).prisma).toBe(prisma);

    Object.defineProperty(process.env, "NODE_ENV", {
      value: originalEnv,
      writable: true,
    });
  });
});
```

- [ ] **Step 2: Run the test to confirm it fails**

```bash
bun run test src/tests/services/prisma.test.ts
```

Expected: FAIL — `Cannot find module '@/services/prisma'`

- [ ] **Step 3: Create `src/services/prisma.ts`**

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 4: Run the test to confirm it passes**

```bash
bun run test src/tests/services/prisma.test.ts
```

Expected: all 3 tests PASS

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma src/services/prisma.ts src/tests/services/prisma.test.ts src/lib/env.ts
git commit -m "feat(prisma): add schema, client singleton, and env vars"
```

---

## Task 6: Export prisma from the services barrel

**Files:**
- Modify: `src/services/index.ts`

- [ ] **Step 1: Add prisma export**

Replace the contents of `src/services/index.ts` with:

```ts
export { prisma } from "./prisma";
```

- [ ] **Step 2: Run type-check**

```bash
bun run type-check
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/services/index.ts
git commit -m "chore(services): export prisma client from barrel"
```

---

## Task 7: Add Prisma scripts to package.json

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add scripts and postinstall**

In `package.json`, update the `"scripts"` block to add:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "biome lint --write .",
  "format": "biome format --write .",
  "type-check": "tsc --noEmit",
  "test": "vitest run",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest run --coverage",
  "prepare": "husky",
  "postinstall": "prisma generate",
  "prisma:migrate": "prisma migrate dev",
  "prisma:generate": "prisma generate",
  "prisma:studio": "prisma studio"
}
```

- [ ] **Step 2: Regenerate the Prisma client**

```bash
bunx prisma generate
```

Expected: `✔ Generated Prisma Client` with the path to the generated client.

- [ ] **Step 3: Run type-check to confirm generated types are valid**

```bash
bun run type-check
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add package.json
git commit -m "chore(prisma): add prisma scripts and postinstall generate"
```

---

## Task 8: Update .env.example and DARTLY_REPO_GUIDE.md

**Files:**
- Modify: `.env.example`
- Modify: `docs/DARTLY_REPO_GUIDE.md`

- [ ] **Step 1: Update `.env.example`**

Replace contents of `.env.example`:

```bash
NODE_ENV=development
LOG_LEVEL=info
LOG_DIR=logs
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database — Supabase PostgreSQL
# DATABASE_URL: pooled connection string (used by Prisma client at runtime)
# DIRECT_URL: direct connection string (used by Prisma migrate)
# Find both in Supabase dashboard → Project Settings → Database → Connection string
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres

# Auth.js — Google OAuth
# AUTH_SECRET: random secret, generate with: openssl rand -base64 32
# AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET: from Google Cloud Console OAuth credentials
AUTH_SECRET=your-auth-secret
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
```

- [ ] **Step 2: Update the env vars table in DARTLY_REPO_GUIDE.md**

Find the `### Available Variables` section (around line 413) and replace its code block:

```bash
# App
NODE_ENV=development
LOG_LEVEL=info
LOG_DIR=logs
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database — Supabase PostgreSQL
DATABASE_URL=postgresql://...   # pooled (runtime)
DIRECT_URL=postgresql://...     # direct (migrations)

# Auth.js — Google OAuth
AUTH_SECRET=...
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
```

- [ ] **Step 3: Update the scripts table in DARTLY_REPO_GUIDE.md**

Find the `| Command | Description |` scripts table (around line 469) and add the new Prisma scripts as bun scripts (replacing the `bunx prisma` entries already present):

```markdown
| `bun run prisma:migrate` | Create and apply Prisma migrations |
| `bun run prisma:generate` | Regenerate Prisma client after schema changes |
| `bun run prisma:studio` | Open Prisma Studio for DB inspection |
```

Also update the "Prisma commands" subsection to reference the bun scripts instead of bare `bunx` calls.

- [ ] **Step 4: Update the Security section in Key Conventions**

Find the line `Session management via Supabase Auth` (around line 604) and replace it with:

```
Session management via Auth.js v5 (Google OAuth)
```

- [ ] **Step 5: Update the Architecture Decisions table in DARTLY_REPO_GUIDE.md**

Find the `Auth | OAuth` row (around line 728) and update it:

```markdown
| Auth           | Auth.js v5 + Google OAuth | Managed OAuth flow, Prisma adapter for sessions |
```

- [ ] **Step 6: Commit**

```bash
git add .env.example docs/DARTLY_REPO_GUIDE.md
git commit -m "docs: update env vars and repo guide for Prisma and Auth.js setup"
```

---

## Task 9: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Run full test suite**

```bash
bun run test
```

Expected: all tests pass including the new `prisma.test.ts`

- [ ] **Step 2: Run type-check**

```bash
bun run type-check
```

Expected: no errors

- [ ] **Step 3: Run build**

```bash
bun run build
```

Expected: build succeeds with no errors or warnings
