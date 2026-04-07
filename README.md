# Dartly

---

## Project Overview

**ATS for Candidates** is a candidate-facing application tracking system designed to give job seekers the same organizational and workflow tools that employers use. The app consolidates job applications, documents, and interview tracking in a single platform, replacing fragmented spreadsheets, notes, and job boards.

**Target Users:**

- Job seekers at any career stage.
- Primarily graduating CS students, but applicable to all professions.

**Platform:** SaaS web application supporting multiple concurrent users with private, account-scoped data.

---

## Core Features

### 1. Dashboard / Job Board (Central Hub)

- Add, edit, archive, and update job entries.
- Move jobs through pipeline stages: Interested → Applied → Interview → Offer → Rejected → Archived.
- Expand job cards for details: documents, interviews, notes, and status tracking.
- Search, filter, and sort jobs.
- View metrics and activity timelines.

### 2. User Profile

- Maintain personal and professional information.
- Sections include: Identity, Professional Summary, Experience, Education, Skills, Career Preferences.
- Profile completion indicators and validations.
- Provides data for document generation workflows.

### 3. Document Library

- Manage resumes and cover letters (upload, create, version, tag, archive/restore).
- Link document versions to jobs.
- Global view with filters and search.
- AI-assisted drafting and tailoring of documents.

### 4. AI Features

- Resume bullet rewriting.
- Job-specific resume and cover letter generation.
- Suggest improvements for user-written content.
- AI outputs are editable and versioned.

---

## Non-Functional Requirements

- **Security:** Password hashing, account isolation, route protection.
- **Reliability:** Stable CRUD operations and document generation.
- **Performance:** Fast page loads under demo conditions.
- **Usability:** Consistent layout, clear error messages, accessible navigation.
- **Testing:** Comprehensive unit tests including edge cases, validation, and authorization.
- **CI/CD:** Automated pipelines for build, test, and deployment checks.
- **Deployment:** Cloud-accessible production app.

---

## Data Model

### Entities

Profile, Experience, Education, Skill, Job, JobStageHistory, JobActivity, Document, DocumentVersion, JobDocumentLink

### Enums

- **JobStage:** `INTERESTED`, `APPLIED`, `INTERVIEW`, `OFFER`, `REJECTED`, `ARCHIVED`
- **ExperienceType:** `EMPLOYMENT`, `PROJECT`
- **DocumentType:** `RESUME`, `COVER_LETTER`, `OTHER`
- **DocumentStatus:** `DRAFT`, `READY`, `ARCHIVED`

### Relationships

- Profile 1:N Experience
- Profile 1:N Education
- Profile 1:N Skill
- User 1:N Job (via `userId`, auth managed by Supabase)
- Job 1:N JobStageHistory
- Job 1:N JobActivity
- User 1:N Document
- Document 1:N DocumentVersion
- Job N:N DocumentVersion via JobDocumentLink

---

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **Backend:** Supabase, Prisma
- **Database:** PostgreSQL (Supabase-managed)
- **Styling:** Tailwind CSS v4 with `@theme` API
- **Validation:** Zod v4
- **Testing:** Vitest + Testing Library + jsdom
- **Linting/Formatting:** Biome
- **Authentication:** Supabase Auth (email/password; OAuth to be added)
- **Logging:** Winston
- **AI Provider:** (TBD)
- **Deployment:** Vercel
- **Package Manager:** Bun

---

## CI/CD

### GitHub Actions

A single `build-and-test` workflow runs on every push and pull request to `main`:

1. **Install dependencies** (`bun install --frozen-lockfile`)
2. **Generate Prisma client** (`bun prisma generate`)
3. **Lint** (`bun lint`)
4. **Type check** (`bun run type-check`)
5. **Test** (`bun run test`)
6. **Build** (`bun run build`)

The pipeline uses Bun on Ubuntu with a 10-minute timeout. Concurrent runs on the same branch are cancelled automatically.

---

## Scripts

| Command               | Description                              |
| --------------------- | ---------------------------------------- |
| `bun dev`             | Start dev server                         |
| `bun run build`       | Production build                         |
| `bun start`           | Start production server                  |
| `bun lint`            | Run Biome lint (with auto-fix)           |
| `bun run format`      | Run Biome formatter                      |
| `bun run type-check`  | TypeScript type checking                 |
| `bun run test`        | Run tests                                |
| `bun run test:ui`     | Vitest UI                                |
| `bun run test:coverage` | Coverage report                        |
| `bun prisma studio`   | Open Prisma Studio                       |
| `bun prisma migrate dev` | Create and apply migrations           |
| `bun prisma generate` | Regenerate Prisma client                 |
| `bun run db:seed`     | Seed the database                        |
| `bun run db:clean`    | Clean and re-seed the database           |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed
- A Supabase project with PostgreSQL database

### Setup

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in your Supabase credentials
3. Install dependencies:

```bash
bun install
```

4. Apply database migrations:

```bash
bun prisma migrate dev
```

5. Start the dev server:

```bash
bun dev
```
