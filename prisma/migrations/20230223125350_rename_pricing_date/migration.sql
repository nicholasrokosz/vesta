/*
  Warnings:

  - You are about to drop the `PricingDates` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PricingDates" DROP CONSTRAINT "PricingDates_pricingId_fkey";

-- DropTable
DROP TABLE "PricingDates";

-- CreateTable
CREATE TABLE "PricingDate" (
    "id" TEXT NOT NULL,
    "pricingId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "percent" INTEGER NOT NULL,

    CONSTRAINT "PricingDate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PricingDate" ADD CONSTRAINT "PricingDate_pricingId_fkey" FOREIGN KEY ("pricingId") REFERENCES "Pricing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
