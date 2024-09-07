/*
  Warnings:

  - A unique constraint covering the columns `[companyId]` on the table `BookingPalConnection` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "BookingPalConnection" ADD COLUMN     "companyId" INT;
UPDATE "BookingPalConnection" SET "companyId" = CAST("bookingPalId" AS INT);
ALTER TABLE "BookingPalConnection" ALTER COLUMN "companyId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "BookingPalConnection_companyId_key" ON "BookingPalConnection"("companyId");
