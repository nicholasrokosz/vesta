/*
  Warnings:

  - Made the column `vendor` on table `PlaidTransaction` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PlaidTransaction" ALTER COLUMN "vendor" SET NOT NULL;
