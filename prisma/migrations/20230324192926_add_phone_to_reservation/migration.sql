/*
  Warnings:

  - Added the required column `phone` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Reservation_bpReservationId_key";

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "phone" TEXT NOT NULL,
ALTER COLUMN "bpReservationId" DROP NOT NULL;
