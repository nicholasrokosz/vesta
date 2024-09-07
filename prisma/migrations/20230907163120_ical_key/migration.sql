/*
  Warnings:

  - A unique constraint covering the columns `[iCalKey]` on the table `Listing` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "iCalKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Listing_iCalKey_key" ON "Listing"("iCalKey");
