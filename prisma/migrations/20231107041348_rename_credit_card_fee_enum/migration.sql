/*
  Warnings:

  - The values [CREDIT_CARD_FEE] on the enum `RevenueDeductionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RevenueDeductionType_new" AS ENUM ('TAX', 'DISCOUNT', 'CHANNEL_COMMISSION', 'CREDIT_CARD');
ALTER TABLE "RevenueTax" ALTER COLUMN "type" TYPE "RevenueDeductionType_new" USING ("type"::text::"RevenueDeductionType_new");
ALTER TYPE "RevenueDeductionType" RENAME TO "RevenueDeductionType_old";
ALTER TYPE "RevenueDeductionType_new" RENAME TO "RevenueDeductionType";
DROP TYPE "RevenueDeductionType_old";
COMMIT;
