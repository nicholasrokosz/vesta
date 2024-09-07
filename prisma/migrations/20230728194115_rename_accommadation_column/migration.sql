/*
  Warnings:

  - You are about to drop the column `accomodation` on the `Revenue` table. All the data in the column will be lost.
  - Added the required column `accommodation` to the `Revenue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable

ALTER TABLE "Revenue" RENAME COLUMN "accomodation" TO "accommodation";
