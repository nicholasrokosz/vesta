/*
  Warnings:

  - You are about to drop the column `channelThreadId` on the `MessageThread` table. All the data in the column will be lost.
  - You are about to drop the column `fromDate` on the `MessageThread` table. All the data in the column will be lost.
  - You are about to drop the column `guestEmail` on the `MessageThread` table. All the data in the column will be lost.
  - You are about to drop the column `guestName` on the `MessageThread` table. All the data in the column will be lost.
  - You are about to drop the column `lastMessageSentAt` on the `MessageThread` table. All the data in the column will be lost.
  - You are about to drop the column `lastMessageText` on the `MessageThread` table. All the data in the column will be lost.
  - You are about to drop the column `listingId` on the `MessageThread` table. All the data in the column will be lost.
  - You are about to drop the column `toDate` on the `MessageThread` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bpReservationId]` on the table `Reservation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bpReservationId` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MessageThread" DROP CONSTRAINT "MessageThread_listingId_fkey";

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "read" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "MessageThread" DROP COLUMN "channelThreadId",
DROP COLUMN "fromDate",
DROP COLUMN "guestEmail",
DROP COLUMN "guestName",
DROP COLUMN "lastMessageSentAt",
DROP COLUMN "lastMessageText",
DROP COLUMN "listingId",
DROP COLUMN "toDate";

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "bpReservationId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_bpReservationId_key" ON "Reservation"("bpReservationId");
