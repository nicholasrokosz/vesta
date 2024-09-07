/*
  Warnings:

  - You are about to drop the column `photos` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the `ListingAddress` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `baths` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `beds` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guests` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `line1` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zip` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `Listing` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ListingAddress" DROP CONSTRAINT "ListingAddress_listingId_fkey";

-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "photos",
ADD COLUMN     "baths" INTEGER NOT NULL,
ADD COLUMN     "beds" INTEGER NOT NULL,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "guests" INTEGER NOT NULL,
ADD COLUMN     "line1" TEXT NOT NULL,
ADD COLUMN     "line2" TEXT,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "zip" TEXT NOT NULL,
ALTER COLUMN "name" SET NOT NULL;

-- DropTable
DROP TABLE "ListingAddress";

-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "photos" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rules" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "pets" BOOLEAN,
    "children" BOOLEAN,
    "smoking" BOOLEAN,
    "house" TEXT,

    CONSTRAINT "Rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pricing" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "minimum" INTEGER NOT NULL,
    "weekday" INTEGER NOT NULL,
    "weekend" INTEGER NOT NULL,
    "winter" INTEGER,
    "spring" INTEGER,
    "summer" INTEGER,
    "fall" INTEGER,

    CONSTRAINT "Pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingDates" (
    "id" TEXT NOT NULL,
    "pricingId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "percent" INTEGER NOT NULL,

    CONSTRAINT "PricingDates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Discount" (
    "id" TEXT NOT NULL,
    "pricingId" TEXT NOT NULL,
    "days" INTEGER NOT NULL,
    "percent" INTEGER,
    "amount" INTEGER,

    CONSTRAINT "Discount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Availability" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "checkIn" TEXT NOT NULL,
    "checkOut" TEXT NOT NULL,
    "minStay" INTEGER NOT NULL,
    "maxStay" INTEGER NOT NULL,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Content_listingId_key" ON "Content"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "Rules_listingId_key" ON "Rules"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "Pricing_listingId_key" ON "Pricing"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "Availability_listingId_key" ON "Availability"("listingId");

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rules" ADD CONSTRAINT "Rules_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pricing" ADD CONSTRAINT "Pricing_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingDates" ADD CONSTRAINT "PricingDates_pricingId_fkey" FOREIGN KEY ("pricingId") REFERENCES "Pricing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discount" ADD CONSTRAINT "Discount_pricingId_fkey" FOREIGN KEY ("pricingId") REFERENCES "Pricing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
