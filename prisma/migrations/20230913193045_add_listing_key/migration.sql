-- CreateEnum
CREATE TYPE "KeyType" AS ENUM ('iCal', 'Direct');

-- CreateTable
CREATE TABLE "ListingKey" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "listingId" TEXT NOT NULL,
    "keyType" "KeyType" NOT NULL,

    CONSTRAINT "ListingKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ListingKey_listingId_key" ON "ListingKey"("listingId");

-- AddForeignKey
ALTER TABLE "ListingKey" ADD CONSTRAINT "ListingKey_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
