-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('House', 'Apartment', 'SecondaryUnit', 'UniqueSpace', 'BedAndBreakfast', 'BoutiqueHotel');

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "unitType" "UnitType" NOT NULL,
    "photos" TEXT,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingAddress" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,

    CONSTRAINT "ListingAddress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ListingAddress_listingId_key" ON "ListingAddress"("listingId");

-- AddForeignKey
ALTER TABLE "ListingAddress" ADD CONSTRAINT "ListingAddress_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
