/*
  Warnings:

  - Made the column `municipal` on table `TaxRates` required. This step will fail if there are existing NULL values in that column.
  - Made the column `county` on table `TaxRates` required. This step will fail if there are existing NULL values in that column.
  - Made the column `state` on table `TaxRates` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
UPDATE "TaxRates" SET "municipal" = 0 WHERE "municipal" IS NULL;
UPDATE "TaxRates" SET "county" = 0 WHERE "county" IS NULL;
UPDATE "TaxRates" SET "state" = 0 WHERE "state" IS NULL;

ALTER TABLE "TaxRates" ALTER COLUMN "municipal" SET NOT NULL,
ALTER COLUMN "municipal" SET DEFAULT 0,
ALTER COLUMN "county" SET NOT NULL,
ALTER COLUMN "county" SET DEFAULT 0,
ALTER COLUMN "state" SET NOT NULL,
ALTER COLUMN "state" SET DEFAULT 0;
