-- CreateEnum
CREATE TYPE "RevenueEntryType" AS ENUM ('ACCOMMODATION', 'GUEST_FEE', 'CANCELLATION_FEE', 'SECURITY_DEPOSIT');

-- AlterTable
ALTER TABLE "RevenueFee" ADD COLUMN     "type" "RevenueEntryType" NOT NULL DEFAULT 'GUEST_FEE';

-- Drop default
ALTER TABLE "RevenueFee" ALTER COLUMN "type" DROP DEFAULT;
