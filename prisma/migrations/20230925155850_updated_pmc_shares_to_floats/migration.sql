/*
  Warnings:

  - Made the column `pmcShare` on table `Deductions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Deductions" ALTER COLUMN "pmcShare" SET NOT NULL,
ALTER COLUMN "pmcShare" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Fee" ALTER COLUMN "share" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Revenue" ALTER COLUMN "pmcShare" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "RevenueFee" ALTER COLUMN "pmcShare" SET DATA TYPE DOUBLE PRECISION;
