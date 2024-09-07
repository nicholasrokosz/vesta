/*
  Warnings:

  - You are about to drop the column `fromDate` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `listingId` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `toDate` on the `Reservation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[calendarEventId]` on the table `Reservation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `calendarEventId` to the `Reservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CalendarEventType" AS ENUM ('Reservation', 'Blocked', 'Maintenance');

-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_listingId_fkey";

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "fromDate",
DROP COLUMN "listingId",
DROP COLUMN "toDate",
ADD COLUMN     "calendarEventId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "CalendarEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "listingId" TEXT NOT NULL,
    "fromDate" TIMESTAMP(3) NOT NULL,
    "toDate" TIMESTAMP(3) NOT NULL,
    "type" "CalendarEventType" NOT NULL,

    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_calendarEventId_key" ON "Reservation"("calendarEventId");

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_calendarEventId_fkey" FOREIGN KEY ("calendarEventId") REFERENCES "CalendarEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
