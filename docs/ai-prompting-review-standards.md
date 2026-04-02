# AI Prompting and Review Context Document

Standards for how AI-generated code is prompted, reviewed, tested, and approved before merge in the Dartly project.

---

## 1. Scope

This document applies to all code produced with AI assistance — whether generated from scratch, refactored by AI, or auto-completed by an AI tool. It covers the entire lifecycle: prompting, writing, reviewing, testing, and merging.

---

## 2. Approved AI Tools

| Tool | Use Case | Notes |
|------|----------|-------|
| Claude Code (CLI / IDE) | Code generation, refactoring, debugging, PR review | Preferred tool; respects `CLAUDE.md` conventions |
| GitHub Copilot | Inline completions, small code suggestions | Acceptable for completions; review every suggestion |
| ChatGPT / Claude (web) | Research, architecture questions, debugging help | Do not paste secrets, env vars, or API keys into web UIs |

Any AI tool not listed above must be approved by the team before use.

---

## 3. Prompting Guidelines

### 3.1 Always Provide Project Context

When prompting AI tools that support project context files (like `CLAUDE.md`), ensure those files are loaded. For tools without automatic context loading, include these key conventions in your prompt:

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript (strict)
- **Database:** Supabase PostgreSQL with Prisma ORM
- **Auth:** Supabase Auth with email/password
- **Styling:** Tailwind CSS v4 with `@theme` API
- **Linting:** Biome (not ESLint/Prettier)
- **Testing:** Vitest + Testing Library + jsdom
- **Path alias:** `@/` maps to `src/`
- **Server code:** All `src/lib/` files must import `"server-only"`
- **Logging:** Use `logger` from `@/lib/logger` (never `console.log` in server code)
- **API errors:** Return `{ error: string }` format with appropriate HTTP status codes

### 3.2 Be Specific About What You Want

Bad prompt:
> "Make a form for creating jobs"

Good prompt:
> "Create a React component at `src/components/jobs/job-form.tsx` for creating a new job application. Use the `Job` model from `prisma/schema.prisma`. The form should use Tailwind CSS v4 classes following our theme conventions (see `docs/ui-ux-standards.md` for the canonical color palette). Include fields for company name, job title, URL, and stage (use the `JobStage` enum). On submit, POST to `/api/jobs`. Handle loading and error states. Follow the existing patterns in `src/components/auth/register-form.tsx`."

### 3.3 Reference Existing Code

Always point AI to existing implementations as examples:

- For API routes: reference `src/app/api/auth/register/route.ts` (uses `withHttpLogging`, `handleApiError`, `checkRateLimit`)
- For components: reference `src/components/auth/register-form.tsx`
- For services: reference `src/services/prisma.ts` or `src/services/supabase.ts`
- For tests: reference `src/tests/` for existing patterns

### 3.4 One Task Per Prompt

Break large features into discrete prompts rather than asking for everything at once. For example, when building a new feature:

1. First prompt: database schema changes
2. Second prompt: service layer / API route
3. Third prompt: UI component
4. Fourth prompt: tests

This produces more focused, reviewable output.

---

## 4. Code Ownership and Attribution

### 4.1 Developer Responsibility

**The developer who commits AI-generated code owns it.** You are responsible for:

- Understanding every line of code you commit
- Ensuring it follows project conventions (see `CLAUDE.md`)
- Verifying it compiles, passes lint, and passes tests
- Fixing any bugs introduced by AI-generated code

"The AI wrote it" is not a valid excuse for broken code.

### 4.2 Attribution

When AI generates a substantial portion of a commit, include a `Co-Authored-By` trailer in the commit message:

```
feat(jobs): add job creation form and API endpoint

Implements the job creation flow with validation and error handling.

Co-Authored-By: Claude <noreply@anthropic.com>
```

Claude Code appends its own model-specific trailer automatically. If writing manually, `Claude` is sufficient.

For minor completions — single-line autocompletes, import suggestions, or trivial boilerplate — attribution is not required.

This is for transparency, not blame. It helps the team understand how code was produced.

---

## 5. Review Standards for AI-Generated Code

All AI-generated code goes through the same PR review process as hand-written code. Reviewers should pay extra attention to these common AI pitfalls:

### 5.1 Convention Violations

- [ ] Uses `console.log` / `console.error` in server code instead of `logger` (exception: `error.tsx` is a client component and may use `console.error`)
- [ ] Missing `"server-only"` import in `src/lib/` files
- [ ] Uses ESLint/Prettier config instead of Biome
- [ ] Uses `axios` instead of `fetch`
- [ ] Uses `zod` import instead of `zod/v4`
- [ ] Adds `suppressHydrationWarning` to `<html>`
- [ ] Adds barrel exports to placeholder `index.ts` files that should stay empty
- [ ] Uses raw SQL instead of Prisma typed queries

### 5.2 Security Concerns

- [ ] Hardcoded secrets, API keys, or credentials
- [ ] Missing auth checks on protected API routes
- [ ] Missing rate limiting on public endpoints
- [ ] SQL injection via raw queries (use Prisma)
- [ ] XSS vulnerabilities in rendered user content
- [ ] Bypasses Supabase RLS by using service-role keys inappropriately
- [ ] Exposes internal error details to the client

### 5.3 Over-Engineering

AI tools frequently add unnecessary complexity. Watch for:

- [ ] Abstractions for one-time operations
- [ ] Error handling for impossible scenarios
- [ ] Feature flags or backwards-compatibility shims
- [ ] Excessive comments or docstrings on self-explanatory code
- [ ] Helper utilities that are only used once
- [ ] Speculative "future-proofing" code

### 5.4 Hallucinated APIs

AI models sometimes invent APIs that do not exist. Verify:

- [ ] All imported packages exist in `package.json`
- [ ] All referenced functions/methods exist in the codebase or library
- [ ] Prisma model field names match `prisma/schema.prisma`
- [ ] Supabase client methods are valid for our SDK version
- [ ] Next.js APIs match version 16 (App Router conventions)

---

## 6. Testing Requirements

AI-generated code must meet the same testing standards as hand-written code.

### 6.1 When Tests Are Required

| Change Type | Test Required? |
|-------------|---------------|
| New API route | Yes — test happy path, validation errors, auth failures |
| New component with logic | Yes — test user interactions and state |
| New service function | Yes — test business logic, mock external calls |
| Bug fix | Yes — add regression test proving the fix |
| Pure styling change | No |
| Config / env changes | No (but verify build passes) |

### 6.2 AI-Generated Tests

If AI generates tests for you, verify:

- Tests actually assert meaningful behavior (not just "it renders without crashing")
- Mocks are realistic and match actual API shapes
- Tests would fail if the feature broke (not tautological)
- Tests follow existing patterns in `src/tests/`
- No snapshot tests unless explicitly approved

### 6.3 Verification Commands

Before marking any AI-assisted work as complete, run:

```bash
bun run test          # All tests pass
bun run type-check    # No TypeScript errors
bun lint              # Biome lint passes
bun run build         # Production build succeeds
```

All four must pass. Do not open a PR with any of these failing.

---

## 7. Merge Approval Process

### 7.1 PR Requirements

In addition to the standard Code Review Checklist in `docs/DARTLY_REPO_GUIDE.md`, every PR containing AI-generated code must:

1. **Pass CI** — build, test, lint, and type-check all green
2. **Have a clear description** — what was changed and why
3. **Reference the ticket** — link to the GitHub issue
4. **Get at least one approval** — from a team member who was not the author
5. **Have no unresolved review comments**

### 7.2 PR Description for AI-Assisted Work

When a PR includes significant AI-generated code, note it in the PR description:

```markdown
## Summary
- Added job creation form and API endpoint
- AI-assisted: Claude Code was used for initial component scaffolding and test generation
- Manually adjusted: form validation logic, error handling, styling to match UI standards

## Test Plan
- [ ] Job creation happy path works
- [ ] Validation errors display correctly
- [ ] Unauthorized users are redirected
- [ ] Tests pass locally and in CI
```

### 7.3 What Blocks a Merge

- Any CI check failing
- Unresolved reviewer comments
- Missing tests for new logic
- Convention violations from Section 5.1
- Security issues from Section 5.2
- No linked GitHub issue

---

## 8. Prohibited Uses

Do not use AI tools for:

| Prohibited | Reason |
|------------|--------|
| Generating `.env` or secret values | Risk of committing credentials |
| Modifying auth/RLS policies without understanding them | Security-critical; must be manually verified |
| Bulk-generating code without reviewing each file | Leads to convention drift and hidden bugs |
| Committing AI output without running the quality checklist | CI should catch this, but don't rely on it |
| Pasting production data or real user info into AI prompts | Privacy and compliance risk |
| Using AI to write commit messages without reading the diff | Messages must accurately describe the change |

---

## 9. Project-Specific AI Context Quick Reference

Keep this handy when prompting AI tools that do not have `CLAUDE.md` auto-loaded:

```
Project: Dartly — ATS for job candidates
Stack: Next.js 16 (App Router), React 19, TypeScript strict
DB: Supabase PostgreSQL + Prisma ORM
Auth: Supabase Auth (email/password), RLS for data isolation
CSS: Tailwind CSS v4, dark theme, Geist Mono font
Lint: Biome (not ESLint), pre-commit hooks enforce style
Test: Vitest + Testing Library + jsdom
Deploy: Vercel
Path alias: @/ → src/
Logger: Winston (src/lib/logger.ts), never console.log in server code
API format: { error: string } for errors, withHttpLogging wrapper
Rate limit: checkRateLimit on public endpoints
Server-only: all src/lib/ files import "server-only"
```

---

## 10. Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-30 | Ethan Yucetepe | Initial version |
