/*
  Warnings:

  - You are about to drop the column `messageThreadId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `messageThreadId` on the `ScheduledMessage` table. All the data in the column will be lost.
  - You are about to drop the `MessageThread` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[reservationId,messageTemplateId]` on the table `ScheduledMessage` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reservationId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reservationId` to the `ScheduledMessage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_messageThreadId_fkey";

-- DropForeignKey
ALTER TABLE "MessageThread" DROP CONSTRAINT "MessageThread_reservationId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduledMessage" DROP CONSTRAINT "ScheduledMessage_messageThreadId_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "messageThreadId",
ADD COLUMN     "reservationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ScheduledMessage" DROP COLUMN "messageThreadId",
ADD COLUMN     "reservationId" TEXT NOT NULL;

-- DropTable
DROP TABLE "MessageThread";

-- CreateTable
CREATE TABLE "_ListingToMessageTemplate" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ListingToMessageTemplate_AB_unique" ON "_ListingToMessageTemplate"("A", "B");

-- CreateIndex
CREATE INDEX "_ListingToMessageTemplate_B_index" ON "_ListingToMessageTemplate"("B");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledMessage_reservationId_messageTemplateId_key" ON "ScheduledMessage"("reservationId", "messageTemplateId");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledMessage" ADD CONSTRAINT "ScheduledMessage_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ListingToMessageTemplate" ADD CONSTRAINT "_ListingToMessageTemplate_A_fkey" FOREIGN KEY ("A") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ListingToMessageTemplate" ADD CONSTRAINT "_ListingToMessageTemplate_B_fkey" FOREIGN KEY ("B") REFERENCES "MessageTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
