-- Add indexes on foreign keys and common WHERE columns.
-- Postgres does not auto-create indexes on FK columns; without these,
-- list/dashboard queries scan sequentially.

-- Job: scoped lookups by user, by user+stage, and by user+lastActivityAt.
CREATE INDEX IF NOT EXISTS "Job_userId_idx" ON "Job"("userId");
CREATE INDEX IF NOT EXISTS "Job_userId_stage_idx" ON "Job"("userId", "stage");
CREATE INDEX IF NOT EXISTS "Job_userId_lastActivityAt_idx" ON "Job"("userId", "lastActivityAt");

-- JobStageHistory: history queries scoped per job, ordered by changedAt.
CREATE INDEX IF NOT EXISTS "JobStageHistory_jobId_changedAt_idx" ON "JobStageHistory"("jobId", "changedAt");

-- JobActivity: activity feed scoped per job, ordered by createdAt.
CREATE INDEX IF NOT EXISTS "JobActivity_jobId_createdAt_idx" ON "JobActivity"("jobId", "createdAt");

-- Document: per-user listing, plus typical sort by updatedAt.
CREATE INDEX IF NOT EXISTS "Document_userId_isDeleted_idx" ON "Document"("userId", "isDeleted");
CREATE INDEX IF NOT EXISTS "Document_userId_updatedAt_idx" ON "Document"("userId", "updatedAt");

-- DocumentVersion: enforce unique versionNumber per document and add index
-- for the orderBy{ versionNumber: desc } latest-version lookup.
CREATE UNIQUE INDEX IF NOT EXISTS "DocumentVersion_documentId_versionNumber_key" ON "DocumentVersion"("documentId", "versionNumber");
-- The unique index above also serves as the lookup index, but we keep an
-- explicit (documentId, versionNumber) index name to mirror the schema.
CREATE INDEX IF NOT EXISTS "DocumentVersion_documentId_versionNumber_idx" ON "DocumentVersion"("documentId", "versionNumber");

-- JobDocumentLink: per-job listing ordered by linkedAt + per-document filter.
CREATE INDEX IF NOT EXISTS "JobDocumentLink_jobId_linkedAt_idx" ON "JobDocumentLink"("jobId", "linkedAt");
CREATE INDEX IF NOT EXISTS "JobDocumentLink_documentId_idx" ON "JobDocumentLink"("documentId");
