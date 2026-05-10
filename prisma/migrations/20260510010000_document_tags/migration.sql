-- Replace the unused Document.category column with a real tags array. The
-- old column had no UI and no API surface; tags are user-typed labels with
-- service-level dedupe, normalization, and per-document length limits. Default
-- empty array keeps existing rows valid without a backfill.

ALTER TABLE "Document" ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "Document" DROP COLUMN "category";
