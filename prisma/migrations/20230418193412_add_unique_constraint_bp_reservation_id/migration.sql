/*
  Warnings:

  - A unique constraint covering the columns `[bpReservationId]` on the table `Reservation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Availability" ALTER COLUMN "noCheckinDays" DROP NOT NULL,
ALTER COLUMN "noCheckoutDays" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_bpReservationId_key" ON "Reservation"("bpReservationId");
