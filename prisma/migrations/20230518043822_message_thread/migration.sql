/*
  Warnings:

  - You are about to drop the column `reservationId` on the `Message` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[messageThreadId]` on the table `Reservation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `messageThreadId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `messageThreadId` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_reservationId_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "reservationId",
ADD COLUMN     "messageThreadId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "messageThreadId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "MessageThread" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listingId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "bpThreadId" TEXT,
    "channelThreadId" TEXT,
    "channel" "Channel" NOT NULL DEFAULT 'Direct',

    CONSTRAINT "MessageThread_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MessageThread_bpThreadId_key" ON "MessageThread"("bpThreadId");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_messageThreadId_key" ON "Reservation"("messageThreadId");

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_messageThreadId_fkey" FOREIGN KEY ("messageThreadId") REFERENCES "MessageThread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageThread" ADD CONSTRAINT "MessageThread_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageThread" ADD CONSTRAINT "MessageThread_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_messageThreadId_fkey" FOREIGN KEY ("messageThreadId") REFERENCES "MessageThread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
