-- CreateEnum
CREATE TYPE "RevenuePayoutStatus" AS ENUM ('FULL', 'PARTIAL', 'UNPAID');

-- AlterTable
ALTER TABLE "Revenue" ADD COLUMN     "payoutStatus" "RevenuePayoutStatus" NOT NULL DEFAULT 'UNPAID';

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "channel" "Channel" NOT NULL,
    "date" DATE NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "allocated" BOOLEAN NOT NULL DEFAULT false,
    "plaidTransactionId" TEXT,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevenuePayout" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "payoutId" TEXT NOT NULL,
    "revenueId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "RevenuePayout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payout_plaidTransactionId_key" ON "Payout"("plaidTransactionId");

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_plaidTransactionId_fkey" FOREIGN KEY ("plaidTransactionId") REFERENCES "PlaidTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevenuePayout" ADD CONSTRAINT "RevenuePayout_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "Payout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevenuePayout" ADD CONSTRAINT "RevenuePayout_revenueId_fkey" FOREIGN KEY ("revenueId") REFERENCES "Revenue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
