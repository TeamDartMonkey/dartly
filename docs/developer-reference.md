# Developer Reference

Technical reference for the Dartly project. Covers the tech stack, CI/CD pipeline, available scripts, and the data model.

---

## Tech Stack

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

| Command | Description |
|---------|-------------|
| `bun dev` | Start dev server |
| `bun run build` | Production build |
| `bun start` | Start production server |
| `bun lint` | Run Biome lint (with auto-fix) |
| `bun run format` | Run Biome formatter |
| `bun run type-check` | TypeScript type checking |
| `bun run test` | Run tests |
| `bun run test:ui` | Vitest UI |
| `bun run test:coverage` | Coverage report |
| `bun prisma studio` | Open Prisma Studio for database inspection |
| `bun prisma migrate dev` | Create and apply database migrations |
| `bun prisma generate` | Regenerate Prisma client after schema changes |
| `bun run db:seed` | Seed the database |
| `bun run db:clean` | Clean and re-seed the database |

---

## Data Model

### Entities

Profile, Experience, Education, Skill, Job, JobStageHistory, JobActivity, Document, DocumentVersion, JobDocumentLink, UserSettings

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
- User 1:1 UserSettings (via `userId`)

For the full schema, see `prisma/schema.prisma`.
