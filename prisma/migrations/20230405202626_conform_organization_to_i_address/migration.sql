/*
  Warnings:

  - You are about to drop the column `streetAddress` on the `Organization` table. All the data in the column will be lost.
  - Added the required column `line1` to the `Organization` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable

ALTER TABLE "Organization" ADD COLUMN "line1" TEXT;
ALTER TABLE "Organization" ALTER COLUMN "streetAddress" DROP NOT NULL;
UPDATE "Organization" SET "line1" = "streetAddress";
ALTER TABLE "Organization" ALTER COLUMN "line1" SET NOT NULL;
ALTER TABLE "Organization" ADD COLUMN "line2" TEXT;
