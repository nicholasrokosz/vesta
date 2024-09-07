-- CreateEnum
CREATE TYPE "RevenueDeductionType" AS ENUM ('TAX', 'DISCOUNT', 'CHANNEL_COMMISSION', 'CREDIT_CARD_FEE');

-- AlterTable
ALTER TABLE "RevenueTax" ADD COLUMN     "type" "RevenueDeductionType" NOT NULL DEFAULT 'TAX';


-- Drop default
ALTER TABLE "RevenueTax" ALTER COLUMN "type" DROP DEFAULT;
