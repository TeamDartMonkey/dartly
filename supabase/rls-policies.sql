-- =============================================================================
-- Row-Level Security (RLS) Policies for Dartly
-- =============================================================================
-- Apply this migration to the Supabase database to enforce per-user data
-- isolation at the database level. RLS ensures that even if application code
-- has a bug, users cannot access other users' data.
--
-- IMPORTANT: The userId columns in Prisma tables must contain the Supabase Auth
-- user UUID (auth.uid()) for these policies to work. When creating records,
-- always set userId to the authenticated user's Supabase Auth ID.
--
-- Usage: Run this SQL in the Supabase SQL Editor or via psql.
-- This script is idempotent — safe to re-run.
-- =============================================================================

-- =============================================================================
-- 1. Directly owned tables (have a userId column)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Profile
-- ---------------------------------------------------------------------------
ALTER TABLE "Profile" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON "Profile";
CREATE POLICY "Users can view own profile"
  ON "Profile" FOR SELECT
  USING ("userId" = auth.uid()::text);

DROP POLICY IF EXISTS "Users can insert own profile" ON "Profile";
CREATE POLICY "Users can insert own profile"
  ON "Profile" FOR INSERT
  WITH CHECK ("userId" = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update own profile" ON "Profile";
CREATE POLICY "Users can update own profile"
  ON "Profile" FOR UPDATE
  USING ("userId" = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete own profile" ON "Profile";
CREATE POLICY "Users can delete own profile"
  ON "Profile" FOR DELETE
  USING ("userId" = auth.uid()::text);

-- ---------------------------------------------------------------------------
-- Job
-- ---------------------------------------------------------------------------
ALTER TABLE "Job" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own jobs" ON "Job";
CREATE POLICY "Users can view own jobs"
  ON "Job" FOR SELECT
  USING ("userId" = auth.uid()::text);

DROP POLICY IF EXISTS "Users can insert own jobs" ON "Job";
CREATE POLICY "Users can insert own jobs"
  ON "Job" FOR INSERT
  WITH CHECK ("userId" = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update own jobs" ON "Job";
CREATE POLICY "Users can update own jobs"
  ON "Job" FOR UPDATE
  USING ("userId" = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete own jobs" ON "Job";
CREATE POLICY "Users can delete own jobs"
  ON "Job" FOR DELETE
  USING ("userId" = auth.uid()::text);

-- ---------------------------------------------------------------------------
-- Document
-- ---------------------------------------------------------------------------
ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own documents" ON "Document";
CREATE POLICY "Users can view own documents"
  ON "Document" FOR SELECT
  USING ("userId" = auth.uid()::text);

DROP POLICY IF EXISTS "Users can insert own documents" ON "Document";
CREATE POLICY "Users can insert own documents"
  ON "Document" FOR INSERT
  WITH CHECK ("userId" = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update own documents" ON "Document";
CREATE POLICY "Users can update own documents"
  ON "Document" FOR UPDATE
  USING ("userId" = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete own documents" ON "Document";
CREATE POLICY "Users can delete own documents"
  ON "Document" FOR DELETE
  USING ("userId" = auth.uid()::text);

-- =============================================================================
-- 2. Indirectly owned tables (owned through a parent with userId)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Experience (owned via Profile)
-- ---------------------------------------------------------------------------
ALTER TABLE "Experience" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own experiences" ON "Experience";
CREATE POLICY "Users can view own experiences"
  ON "Experience" FOR SELECT
  USING (
    "profileId" IN (
      SELECT "id" FROM "Profile" WHERE "userId" = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can insert own experiences" ON "Experience";
CREATE POLICY "Users can insert own experiences"
  ON "Experience" FOR INSERT
  WITH CHECK (
    "profileId" IN (
      SELECT "id" FROM "Profile" WHERE "userId" = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can update own experiences" ON "Experience";
CREATE POLICY "Users can update own experiences"
  ON "Experience" FOR UPDATE
  USING (
    "profileId" IN (
      SELECT "id" FROM "Profile" WHERE "userId" = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can delete own experiences" ON "Experience";
CREATE POLICY "Users can delete own experiences"
  ON "Experience" FOR DELETE
  USING (
    "profileId" IN (
      SELECT "id" FROM "Profile" WHERE "userId" = auth.uid()::text
    )
  );

-- ---------------------------------------------------------------------------
-- Education (owned via Profile)
-- ---------------------------------------------------------------------------
ALTER TABLE "Education" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own education" ON "Education";
CREATE POLICY "Users can view own education"
  ON "Education" FOR SELECT
  USING (
    "profileId" IN (
      SELECT "id" FROM "Profile" WHERE "userId" = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can insert own education" ON "Education";
CREATE POLICY "Users can insert own education"
  ON "Education" FOR INSERT
  WITH CHECK (
    "profileId" IN (
      SELECT "id" FROM "Profile" WHERE "userId" = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can update own education" ON "Education";
CREATE POLICY "Users can update own education"
  ON "Education" FOR UPDATE
  USING (
    "profileId" IN (
      SELECT "id" FROM "Profile" WHERE "userId" = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can delete own education" ON "Education";
CREATE POLICY "Users can delete own education"
  ON "Education" FOR DELETE
  USING (
    "profileId" IN (
      SELECT "id" FROM "Profile" WHERE "userId" = auth.uid()::text
    )
  );

-- ---------------------------------------------------------------------------
-- Skill (owned via Profile)
-- ---------------------------------------------------------------------------
ALTER TABLE "Skill" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own skills" ON "Skill";
CREATE POLICY "Users can view own skills"
  ON "Skill" FOR SELECT
  USING (
    "profileId" IN (
      SELECT "id" FROM "Profile" WHERE "userId" = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can insert own skills" ON "Skill";
CREATE POLICY "Users can insert own skills"
  ON "Skill" FOR INSERT
  WITH CHECK (
    "profileId" IN (
      SELECT "id" FROM "Profile" WHERE "userId" = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can update own skills" ON "Skill";
CREATE POLICY "Users can update own skills"
  ON "Skill" FOR UPDATE
  USING (
    "profileId" IN (
      SELECT "id" FROM "Profile" WHERE "userId" = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can delete own skills" ON "Skill";
CREATE POLICY "Users can delete own skills"
  ON "Skill" FOR DELETE
  USING (
    "profileId" IN (
      SELECT "id" FROM "Profile" WHERE "userId" = auth.uid()::text
    )
  );

-- ---------------------------------------------------------------------------
-- JobStageHistory (owned via Job)
-- ---------------------------------------------------------------------------
ALTER TABLE "JobStageHistory" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own job stage history" ON "JobStageHistory";
CREATE POLICY "Users can view own job stage history"
  ON "JobStageHistory" FOR SELECT
  USING (
    "jobId" IN (
      SELECT "id" FROM "Job" WHERE "userId" = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can insert own job stage history" ON "JobStageHistory";
CREATE POLICY "Users can insert own job stage history"
  ON "JobStageHistory" FOR INSERT
  WITH CHECK (
    "jobId" IN (
      SELECT "id" FROM "Job" WHERE "userId" = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can update own job stage history" ON "JobStageHistory";
CREATE POLICY "Users can update own job stage history"
  ON "JobStageHistory" FOR UPDATE
  USING (
    "jobId" IN (
      SELECT "id" FROM "Job" WHERE "userId" = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can delete own job stage history" ON "JobStageHistory";
CREATE POLICY "Users can delete own job stage history"
  ON "JobStageHistory" FOR DELETE
  USING (
    "jobId" IN (
      SELECT "id" FROM "Job" WHERE "userId" = auth.uid()::text
    )
  );

-- ---------------------------------------------------------------------------
-- JobActivity (owned via Job)
-- ---------------------------------------------------------------------------
ALTER TABLE "JobActivity" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own job activities" ON "JobActivity";
CREATE POLICY "Users can view own job activities"
  ON "JobActivity" FOR SELECT
  USING (
    "jobId" IN (
      SELECT "id" FROM "Job" WHERE "userId" = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can insert own job activities" ON "JobActivity";
CREATE POLICY "Users can insert own job activities"
  ON "JobActivity" FOR INSERT
  WITH CHECK (
    "jobId" IN (
      SELECT "id" FROM "Job" WHERE "userId" = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can update own job activities" ON "JobActivity";
CREATE POLICY "Users can update own job activities"
  ON "JobActivity" FOR UPDATE
  USING (
    "jobId" IN (
      SELECT "id" FROM "Job" WHERE "userId" = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can delete own job activities" ON "JobActivity";
CREATE POLICY "Users can delete own job activities"
  ON "JobActivity" FOR DELETE
  USING (
    "jobId" IN (
      SELECT "id" FROM "Job" WHERE "userId" = auth.uid()::text
    )
  );

-- ---------------------------------------------------------------------------
-- DocumentVersion (owned via Document)
-- ---------------------------------------------------------------------------
ALTER TABLE "DocumentVersion" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own document versions" ON "DocumentVersion";
CREATE POLICY "Users can view own document versions"
  ON "DocumentVersion" FOR SELECT
  USING (
    "documentId" IN (
      SELECT "id" FROM "Document" WHERE "userId" = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can insert own document versions" ON "DocumentVersion";
CREATE POLICY "Users can insert own document versions"
  ON "DocumentVersion" FOR INSERT
  WITH CHECK (
    "documentId" IN (
      SELECT "id" FROM "Document" WHERE "userId" = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can update own document versions" ON "DocumentVersion";
CREATE POLICY "Users can update own document versions"
  ON "DocumentVersion" FOR UPDATE
  USING (
    "documentId" IN (
      SELECT "id" FROM "Document" WHERE "userId" = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can delete own document versions" ON "DocumentVersion";
CREATE POLICY "Users can delete own document versions"
  ON "DocumentVersion" FOR DELETE
  USING (
    "documentId" IN (
      SELECT "id" FROM "Document" WHERE "userId" = auth.uid()::text
    )
  );

-- ---------------------------------------------------------------------------
-- JobDocumentLink (owned via Job — both job and document must belong to user)
-- ---------------------------------------------------------------------------
ALTER TABLE "JobDocumentLink" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own job document links" ON "JobDocumentLink";
CREATE POLICY "Users can view own job document links"
  ON "JobDocumentLink" FOR SELECT
  USING (
    "jobId" IN (
      SELECT "id" FROM "Job" WHERE "userId" = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can insert own job document links" ON "JobDocumentLink";
CREATE POLICY "Users can insert own job document links"
  ON "JobDocumentLink" FOR INSERT
  WITH CHECK (
    "jobId" IN (
      SELECT "id" FROM "Job" WHERE "userId" = auth.uid()::text
    )
    AND "documentId" IN (
      SELECT "id" FROM "Document" WHERE "userId" = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can update own job document links" ON "JobDocumentLink";
CREATE POLICY "Users can update own job document links"
  ON "JobDocumentLink" FOR UPDATE
  USING (
    "jobId" IN (
      SELECT "id" FROM "Job" WHERE "userId" = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can delete own job document links" ON "JobDocumentLink";
CREATE POLICY "Users can delete own job document links"
  ON "JobDocumentLink" FOR DELETE
  USING (
    "jobId" IN (
      SELECT "id" FROM "Job" WHERE "userId" = auth.uid()::text
    )
  );
