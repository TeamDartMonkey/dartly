---
title: Prisma Setup Design
date: 2026-03-25
status: approved
---

# Prisma Setup Design

## Overview

Install and configure Prisma as the ORM for Dartly. Wire it up to Supabase PostgreSQL, define the full application schema, and set up the Prisma client singleton. Auth is handled by Auth.js v5 with the Prisma adapter and Google OAuth — no Supabase Auth.

## Dependencies

| Package | Type | Purpose |
|---|---|---|
| `prisma` | dev | CLI, schema tooling, migrations |
| `@prisma/client` | prod | Generated type-safe client |
| `next-auth@beta` | prod | Auth.js v5 — OAuth session management |
| `@auth/prisma-adapter` | prod | Wires Auth.js to Prisma |

## Schema Strategy

Single file: `prisma/schema.prisma`. No multi-file split — schema is not large enough to warrant it.

### Auth.js Models (adapter-managed)

Auth.js Prisma adapter requires these 4 models. They are generated per adapter spec and should not be hand-modified:

- `User` — identity record created on first OAuth sign-in
- `Account` — OAuth provider account linked to a User
- `Session` — active session record
- `VerificationToken` — email verification (unused for OAuth-only but required by adapter)

### App Models

All user-scoped models carry a `userId` field (String UUID) that references `User.id`.

**Profile** — 1:1 with User. Top-level professional identity fields.
- Fields: `userId`, `firstName`, `lastName`, `email`, `phone`, `location`, `professionalLinks`, `headline`, `summary`, `targetRoles`, `targetLocations`, `workModePreference`, `salaryPreference`, `completionStatus`, `createdAt`, `updatedAt`
- Relations: has many `Experience`, `Education`, `Skill`

**Experience** — repeating employment/project entries under Profile.
- Fields: `profileId`, `type` (employment | project), `title`, `organization`, `startDate`, `endDate`, `isCurrent`, `description`, `bullets` (String[]), `createdAt`, `updatedAt`

**Education** — repeating education entries under Profile.
- Fields: `profileId`, `institution`, `degree`, `fieldOfStudy`, `startDate`, `endDate`, `gpa`, `honors`, `createdAt`, `updatedAt`

**Skill** — repeating skill entries under Profile.
- Fields: `profileId`, `name`, `category`, `proficiency`, `createdAt`, `updatedAt`

**Job** — job application record, owned by User.
- Fields: `userId`, `title`, `company`, `location`, `description`, `compensationNotes`, `applicationDate`, `stage`, `priority`, `deadline`, `recruiterNotes`, `customNotes`, `lastActivityAt`, `outcomeAt`, `createdAt`, `updatedAt`
- Stage values: `INTERESTED`, `APPLIED`, `INTERVIEW`, `OFFER`, `REJECTED`, `ARCHIVED`
- Relations: has many `JobStageHistory`, `JobActivity`, `JobDocumentLink`

**JobStageHistory** — immutable log of stage transitions per Job.
- Fields: `jobId`, `fromStage`, `toStage`, `changedAt`

**JobActivity** — interviews, follow-ups, and timeline events per Job.
- Fields: `jobId`, `type`, `title`, `description`, `scheduledAt`, `roundType`, `completed`, `createdAt`, `updatedAt`

**Document** — document record owned by User (resume, cover letter, etc.).
- Fields: `userId`, `type`, `name`, `category`, `status`, `isDeleted`, `deletedAt`, `createdAt`, `updatedAt`
- Relations: has many `DocumentVersion`, `JobDocumentLink`

**DocumentVersion** — versioned content snapshot of a Document.
- Fields: `documentId`, `versionNumber`, `content`, `fileUrl`, `createdAt`

**JobDocumentLink** — join table linking a Job to a specific DocumentVersion.
- Fields: `jobId`, `documentVersionId`, `linkedAt`
- Constraint: unique on `(jobId, documentVersionId)`

## Entity Relationships

```
User 1:1 Profile
Profile 1:N Experience
Profile 1:N Education
Profile 1:N Skill
User 1:N Job
User 1:N Document
Job 1:N JobStageHistory
Job 1:N JobActivity
Job N:N DocumentVersion (via JobDocumentLink)
Document 1:N DocumentVersion
```

## Prisma Client Singleton

File: `src/services/prisma.ts`

Standard Next.js singleton pattern — prevents multiple `PrismaClient` instances during hot reload in development. Exported via `src/services/index.ts`.

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

## Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Supabase PostgreSQL connection string (pooled) |
| `AUTH_SECRET` | Auth.js secret for signing sessions |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |

All added to `.env.example` with placeholder values.

## Scripts (additions to package.json)

```json
"prisma:migrate": "prisma migrate dev",
"prisma:generate": "prisma generate",
"prisma:studio": "prisma studio"
```

## Additional Steps

- Update `.env.example` with all 4 environment variables and placeholder values
- Update `docs/DARTLY_REPO_GUIDE.md` to reflect Prisma setup, new scripts, and required env vars

## Out of Scope

- Auth.js route handler and `auth.ts` config (separate story)
- RLS policies in Supabase (separate story)
- Actual migrations beyond the initial baseline (follow-on work)
