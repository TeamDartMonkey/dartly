-- Replace single free-form prepNotes column with three structured columns so
-- the Interview Prep UI can render discrete sections (STAR stories, Questions
-- to ask, Talking points). Existing prepNotes content is dropped — pre-launch
-- and seed data will be regenerated.

ALTER TABLE "Job" ADD COLUMN "prepNotesStar" TEXT;
ALTER TABLE "Job" ADD COLUMN "prepNotesQuestions" TEXT;
ALTER TABLE "Job" ADD COLUMN "prepNotesTalkingPoints" TEXT;

ALTER TABLE "Job" DROP COLUMN "prepNotes";
