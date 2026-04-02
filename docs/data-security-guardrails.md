# Data and Security Guardrails Context Document

Standards for per-user data ownership, authorization checks, protected route behavior, and prohibited cross-user access patterns in the Dartly project.

---

## 1. Data Ownership Model

Every user-owned entity in Dartly has a `userId` foreign key that ties it to exactly one user. This is the foundation of all data isolation.

### 1.1 Ownership Chain

```
User (Supabase Auth)
├── Profile          (1:1, userId)
│   ├── Experience[] (via profileId → Profile.userId)
│   ├── Education[]  (via profileId → Profile.userId)
│   └── Skill[]      (via profileId → Profile.userId)
├── Job[]            (1:N, userId)
│   ├── JobStageHistory[]  (via jobId → Job.userId)
│   ├── JobActivity[]      (via jobId → Job.userId)
│   └── JobDocumentLink[]  (via jobId → Job.userId)
└── Document[]       (1:N, userId)
    ├── DocumentVersion[]  (via documentId → Document.userId)
    └── JobDocumentLink[]  (via documentId → Document.userId)
```

### 1.2 Ownership Rules

| Rule | Detail |
|------|--------|
| Direct ownership | `Profile`, `Job`, `Document` have a `userId` column referencing `User.id` |
| Indirect ownership | `Experience`, `Education`, `Skill` are owned through `Profile`. `JobStageHistory`, `JobActivity` are owned through `Job`. `DocumentVersion` is owned through `Document` |
| Cascade deletes | All relations use `onDelete: Cascade` — deleting a user removes all their data |
| No shared entities | There are no shared or team-owned records. Every record belongs to exactly one user |
| No orphaned records | Foreign keys enforce referential integrity. A record cannot exist without its parent |

---

## 2. Authorization Architecture

### 2.1 Authentication Layer: Supabase Auth

Supabase Auth manages user identity. Every authenticated request includes a session that identifies the user.

- **Registration:** Email/password via `supabase.auth.signUp()` (see `src/services/auth.ts`)
- **Login:** Email/password via Supabase Auth session
- **Session storage:** Supabase manages JWT tokens
- **OAuth:** Google OAuth planned (not yet implemented)

### 2.2 Row-Level Security (RLS)

RLS is the primary data isolation mechanism. Supabase RLS policies run at the database level, meaning even if application code has a bug, users cannot access other users' data.

**RLS policy pattern for all user-owned tables:**

```sql
-- Enable RLS on the table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see their own rows
CREATE POLICY "Users can view own data"
  ON profiles FOR SELECT
  USING (user_id = auth.uid());

-- Users can only insert rows they own
CREATE POLICY "Users can insert own data"
  ON profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can only update their own rows
CREATE POLICY "Users can update own data"
  ON profiles FOR UPDATE
  USING (user_id = auth.uid());

-- Users can only delete their own rows
CREATE POLICY "Users can delete own data"
  ON profiles FOR DELETE
  USING (user_id = auth.uid());
```

**Apply this pattern to every user-owned table:** `profiles`, `jobs`, `documents`, `job_stage_history`, `job_activities`, `document_versions`, `job_document_links`.

For indirectly owned tables (e.g. `experiences` owned through `profiles`), the RLS policy should join through the parent:

```sql
CREATE POLICY "Users can view own experiences"
  ON experiences FOR SELECT
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );
```

### 2.3 Application-Level Auth Checks

While RLS is the safety net, API routes must still verify authentication before processing requests. This prevents unauthenticated users from even reaching the database.

**Required pattern for all protected API routes:**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { withHttpLogging } from "@/lib/api-wrapper";
import { handleApiError } from "@/lib/api-error";
import { supabase } from "@/services/supabase";

export async function GET(request: NextRequest) {
  return withHttpLogging(request, async () => {
    // 1. Extract and verify session
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Query using the authenticated user's ID
    //    RLS enforces scoping, but always pass userId for clarity
    const data = await prisma.job.findMany({
      where: { userId: user.id },
    });

    return NextResponse.json(data);
  });
}
```

**Key points:**
- Always verify the session before any database operation
- Return `401 Unauthorized` for missing/invalid sessions
- Return `403 Forbidden` when a user tries to access a resource they don't own
- Never trust client-supplied user IDs — always use the session's `user.id`

---

## 3. Protected Route Behavior

### 3.1 Route Classification

| Route Type | Examples | Auth Required | Behavior |
|------------|----------|---------------|----------|
| Public | `/`, `/register`, `/login` | No | Accessible to anyone |
| Protected | `/dashboard`, `/profile`, `/documents`, `/settings` | Yes | Redirect to `/login` if unauthenticated |
| API (public) | `POST /api/auth/register`, `GET /api/health` | No | Rate limited, no session check |
| API (protected) | `GET /api/jobs`, `PUT /api/profile` | Yes | Return `401` if unauthenticated |

### 3.2 Middleware Route Protection

The middleware (`src/proxy.ts`) handles route protection for frontend pages. It checks Supabase session and redirects unauthenticated users.

**Protected route behavior:**
1. User navigates to a protected page (e.g. `/dashboard`)
2. Middleware checks for a valid Supabase session
3. If no session: redirect to `/login`
4. If valid session: allow the request through

**API routes are excluded from middleware** (see the matcher pattern in `proxy.ts`). API routes handle their own auth checks directly in the route handler.

### 3.3 Security Headers

Security headers are defined in `next.config.ts` via `headers()`, not in middleware. These include:

- **Content-Security-Policy** — restricts script/style sources
- **X-Frame-Options: DENY** — prevents clickjacking
- **X-Content-Type-Options: nosniff** — prevents MIME sniffing
- **Referrer-Policy: strict-origin-when-cross-origin** — limits referrer leakage

---

## 4. Prohibited Cross-User Access Patterns

These patterns are **never allowed** in Dartly. Any code implementing these should be rejected in review.

### 4.1 Never Trust Client-Supplied User IDs

```typescript
// PROHIBITED — user could pass any userId in the request body
const { userId, title } = await request.json();
await prisma.job.create({ data: { userId, title, company } });

// CORRECT — always use the session's authenticated user ID
const { data: { user } } = await supabase.auth.getUser();
await prisma.job.create({ data: { userId: user.id, title, company } });
```

### 4.2 Never Expose Other Users' Data in Queries

```typescript
// PROHIBITED — no user scoping, returns ALL jobs in the database
const jobs = await prisma.job.findMany();

// CORRECT — scoped to the authenticated user
const jobs = await prisma.job.findMany({
  where: { userId: user.id },
});
```

### 4.3 Never Allow ID Enumeration

```typescript
// PROHIBITED — fetches any job by ID without ownership check
const job = await prisma.job.findUnique({ where: { id: jobId } });

// CORRECT — verify ownership in the query
const job = await prisma.job.findFirst({
  where: { id: jobId, userId: user.id },
});
if (!job) {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
```

**Return `404 Not Found` instead of `403 Forbidden`** when a user tries to access another user's resource. This prevents confirming that the resource exists.

### 4.4 Never Bypass RLS with Service Role Keys

```typescript
// PROHIBITED — service role key bypasses ALL RLS policies
const adminClient = createClient(url, SERVICE_ROLE_KEY);
const { data } = await adminClient.from("jobs").select("*");

// CORRECT — use the user's session-scoped client
const { data } = await supabase.from("jobs").select("*");
```

The Supabase service role key should only be used for:
- Database migrations
- Admin scripts that run outside the app
- Never in API route handlers

### 4.5 Never Leak Data Through Includes/Joins

```typescript
// PROHIBITED — joining through Job to Document could expose
// documents owned by other users if the link table isn't scoped
const job = await prisma.job.findFirst({
  where: { id: jobId, userId: user.id },
  include: {
    documentLinks: {
      include: {
        document: true,  // Could include documents from other users
      },
    },
  },
});

// CORRECT — verify document ownership in the join
const job = await prisma.job.findFirst({
  where: { id: jobId, userId: user.id },
  include: {
    documentLinks: {
      include: {
        document: {
          where: { userId: user.id },
        },
      },
    },
  },
});
```

---

## 5. API Security Checklist

Every API route must satisfy these checks before merge:

### 5.1 Authentication

- [ ] Session verified before any database operation
- [ ] Returns `401` for missing/invalid sessions
- [ ] User ID sourced from session, never from request body or URL

### 5.2 Authorization

- [ ] Queries scoped to the authenticated user's ID
- [ ] Resource ownership verified before update/delete
- [ ] Returns `404` (not `403`) for resources the user doesn't own

### 5.3 Input Validation

- [ ] Request body validated with Zod schemas (`zod/v4`)
- [ ] IDs validated as proper format before database queries
- [ ] No raw SQL — all queries through Prisma typed client

### 5.4 Rate Limiting

- [ ] Public endpoints (register, login, health) have `checkRateLimit` applied
- [ ] Rate limit IDs are unique per route (e.g. `"api/auth/register"`)

### 5.5 Error Handling

- [ ] Errors handled via `handleApiError` for consistent `{ error: string }` responses
- [ ] Internal error details never exposed to the client
- [ ] All requests logged via `withHttpLogging` wrapper
- [ ] Server-side logging uses `logger`, never `console.log`

---

## 6. Environment and Secrets

### 6.1 Secret Management Rules

| Rule | Detail |
|------|--------|
| Never commit `.env.local` | Contains real credentials; `.gitignore` excludes it |
| Use `.env.example` for templates | Placeholder values only, never real keys |
| Validate at startup | `src/lib/env.ts` uses Zod to fail fast on missing vars |
| Prefix client-safe vars | Only `NEXT_PUBLIC_*` vars are exposed to the browser |
| Server-only vars | `DATABASE_URL`, `AUTH_SECRET` are server-side only |

### 6.2 Key Sensitivity Levels

| Variable | Exposure | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Server only | Direct database access — never expose |
| `AUTH_SECRET` | Server only | Session signing key |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Server only | OAuth credentials |
| `NEXT_PUBLIC_SUPABASE_URL` | Client OK | Public project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Client OK | Publishable key, safe for client use with RLS |

### 6.3 Logger Redaction

The Winston logger (`src/lib/logger.ts`) automatically redacts sensitive keys from log output: `password`, `token`, `authorization`, `secret`, `apikey`. This prevents accidental credential leaks in log files.

---

## 7. Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-30 | Ethan Yucetepe | Initial version |
