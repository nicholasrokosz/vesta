-- CreateEnum
CREATE TYPE "FeeType" AS ENUM ('Channel', 'CreditCard', 'Guest', 'Additional');

-- AlterTable
ALTER TABLE "Tax" ADD COLUMN     "revenueFeeId" TEXT;

-- CreateTable
CREATE TABLE "RevenueFee" (
    "id" TEXT NOT NULL,
    "revenueId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "type" "FeeType" NOT NULL,
    "pmcShare" INTEGER NOT NULL,

    CONSTRAINT "RevenueFee_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Tax" ADD CONSTRAINT "Tax_revenueFeeId_fkey" FOREIGN KEY ("revenueFeeId") REFERENCES "RevenueFee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevenueFee" ADD CONSTRAINT "RevenueFee_revenueId_fkey" FOREIGN KEY ("revenueId") REFERENCES "Revenue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
