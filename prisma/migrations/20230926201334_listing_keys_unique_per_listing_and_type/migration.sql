/*
  Warnings:

  - A unique constraint covering the columns `[listingId,keyType]` on the table `ListingKey` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ListingKey_listingId_key";

-- CreateIndex
CREATE UNIQUE INDEX "ListingKey_listingId_keyType_key" ON "ListingKey"("listingId", "keyType");
