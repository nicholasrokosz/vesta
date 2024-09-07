/*
  Warnings:

  - You are about to drop the column `bookingPalId` on the `BookingPalConnection` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "BookingPalConnection_bookingPalId_key";

-- AlterTable
ALTER TABLE "BookingPalConnection" DROP COLUMN "bookingPalId";
