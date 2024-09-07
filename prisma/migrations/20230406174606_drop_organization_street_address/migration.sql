/*
  Warnings:

  - You are about to drop the column `streetAddress` on the `Organization` table. All the data in the column will be lost.
  - Made the column `line1` on table `Organization` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "streetAddress";
