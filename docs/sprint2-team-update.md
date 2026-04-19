# Sprint 2 — Team Update

**From:** Ethan
**Date:** April 19, 2026
**Status:** All 26 Sprint 2 tickets merged. Code review + hardening pass complete. Demo-ready.

---

## What shipped

All 26 stories are in `main`:

| Owner   | Tickets                                      | Area                     |
|---------|----------------------------------------------|--------------------------|
| Justin  | S2-001–S2-005                                | Dashboard search, filter, sort, stage badges, card→detail |
| Bruce   | S2-008, S2-009, S2-013, S2-014, S2-015        | Stage transitions + timestamps, outcomes, archive, delete |
| Kenji   | S2-006, S2-007, S2-010, S2-011, S2-012        | Job detail overview, deadlines, activity timeline, interviews, follow-ups |
| Francis | S2-016–S2-020                                | Profile CRUD (experience, education, skills, preferences, save UX) |
| Ethan   | S2-021–S2-026                                | AI resume/cover letter/rewrite, document save, metrics, unit tests |

## What I did tonight (pre-demo hardening)

Ran a full code review on the Sprint 2 code and pushed fixes across infra, AI services, documents, metrics, and tests. Everything green:

- **Tests:** 119 → 133 passing (14 new negative-path tests)
- **Type-check:** 0 errors
- **Lint:** 0 warnings
- **Build:** clean

### Critical fixes

1. **Document version race condition** (`src/services/documents.ts`)
   Two concurrent writes to a document could both read the same `versionNumber = N` and create duplicate version rows. Moved version-number computation inside a `Serializable` transaction using `aggregate({ _max: versionNumber })`. Affects `updateDocumentContent` and `createDocumentVersion`.

2. **Duplicate JobDocumentLink surfaced as 500** (`src/services/documents.ts`)
   P2002 unique violation on `@@unique([jobId, documentVersionId])` now throws a friendly `ApiError(409, "Document version already linked to this job")`.

### Important fixes

3. **Rate limiting on `/api/ai/*`**
   Added per-IP `checkRateLimit` to `/api/ai/resume`, `/api/ai/cover-letter`, `/api/ai/rewrite`. 10/min on generation, 20/min on rewrite. Protects us once we swap the stub for a real provider.

4. **AI stub warning**
   `src/services/ai.ts` now emits `logger.warn("AI stub provider invoked…")` on every call so it's obvious in logs we're not calling a real model yet.

5. **Expanded negative-path test coverage** (Sprint 2 rubric explicitly penalizes happy-path-only tests)
   - Validation failure → 400
   - Rate limit hit → 429
   - Formal and no-op branches of rewrite
   - Soft-delete filter assertions on document queries
   - Version increment via aggregate inside Serializable transaction
   - P2002 → 409 ApiError

### Nitpick fixes

6. **Metrics query efficiency** — replaced `findMany()` returning all columns with `select: { id, stage }` / `{ jobId, changedAt }`.
7. **Pushed soft-delete filter into DB** — `getDocumentsForJob` now filters `document: { isDeleted: false }` in the `where` instead of client-side.
8. **Sanitized rewrite log** — logs `instructionLength` instead of the full user instruction text (PII leakage risk).
9. **Removed redundant `status: "DRAFT"`** in `createDocument` — Prisma schema default already handles it.
10. **Biome 2.4.8 → 2.4.10** + biome.json schema aligned.
11. **Fixed `html-to-pdf.mjs`** — `node:` protocol imports.
12. **Removed stale biome-ignore** in `experience-section.tsx` (drag/drop refactor left it orphaned).

## Demo-day checklist (Phase A: 8 min / Phase B: 7 min)

- [ ] Seed DB with ≥ 8 jobs across multiple stages
- [ ] Seed profile with ≥ 2 experiences, educations, skills
- [ ] Pre-generate ≥ 2 AI document drafts (so we don't burn demo time on generation)
- [ ] CI tab open (build + 133 tests passing)
- [ ] Credentials in a clipboard-ready text file
- [ ] One "broken" test to show a meaningful failure mode? (optional, for rubric points)

Demo script PDF: `docs/sprint2-demo-script.pdf` (separate attachment).

## Known items (punting to Sprint 3)

- AI provider is still a stub — this is expected, `AI_PROVIDER` env gate planned for S3.
- Shared Supabase dev DB has minor schema drift from the team's parallel branches; I did **not** run `prisma migrate dev` to avoid wiping teammate data. We should coordinate a clean reset before deploy.
- No `@@unique([documentId, versionNumber])` at the DB level yet — app-level `Serializable` transaction is protection until we can migrate.

Questions? Ping me.

— Ethan
