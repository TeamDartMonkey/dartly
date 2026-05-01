-- Add companyResearch and prepNotes to Job
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "companyResearch" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "prepNotes" TEXT;