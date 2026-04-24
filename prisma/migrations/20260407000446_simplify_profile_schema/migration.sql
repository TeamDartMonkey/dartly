/*
  Warnings:

  - You are about to drop the column `honors` on the `Education` table. All the data in the column will be lost.
  - You are about to drop the column `bullets` on the `Experience` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Skill` table. All the data in the column will be lost.
  - You are about to drop the column `proficiency` on the `Skill` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Education" DROP COLUMN "honors";

-- AlterTable
ALTER TABLE "public"."Experience" DROP COLUMN "bullets";

-- AlterTable
ALTER TABLE "public"."Skill" DROP COLUMN "category",
DROP COLUMN "proficiency";
