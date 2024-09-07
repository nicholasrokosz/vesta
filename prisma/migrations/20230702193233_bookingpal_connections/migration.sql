/*
  Warnings:

  - A unique constraint covering the columns `[ownerId]` on the table `BookingPalConnection` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "BookingPalConnection" DROP CONSTRAINT "BookingPalConnection_organizationId_fkey";

-- AlterTable
ALTER TABLE "BookingPalConnection" ADD COLUMN     "ownerId" TEXT,
ALTER COLUMN "organizationId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "BookingPalConnection_ownerId_key" ON "BookingPalConnection"("ownerId");

-- AddForeignKey
ALTER TABLE "BookingPalConnection" ADD CONSTRAINT "BookingPalConnection_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingPalConnection" ADD CONSTRAINT "BookingPalConnection_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
