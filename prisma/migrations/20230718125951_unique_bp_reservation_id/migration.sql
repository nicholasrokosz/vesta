/*
  Warnings:

  - A unique constraint covering the columns `[bpProductId]` on the table `Listing` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Listing_bpProductId_key" ON "Listing"("bpProductId");
