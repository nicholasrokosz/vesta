/*
  Warnings:

  - A unique constraint covering the columns `[bpMessageId]` on the table `Message` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[channelMessageId]` on the table `Message` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[channelThreadId]` on the table `MessageThread` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[guestId,listingId,channel]` on the table `MessageThread` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `timestamp` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateFrom` to the `MessageThread` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateTo` to the `MessageThread` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Guest_email_organizationId_key";

-- AlterTable
ALTER TABLE "Guest" ADD COLUMN     "channel" "Channel" NOT NULL DEFAULT 'Direct',
ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "bpMessageId" TEXT,
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "MessageThread" ADD COLUMN     "dateFrom" TEXT NOT NULL,
ADD COLUMN     "dateTo" TEXT NOT NULL,
ALTER COLUMN "channel" DROP DEFAULT;



-- CreateIndex
CREATE UNIQUE INDEX "Message_bpMessageId_key" ON "Message"("bpMessageId");

-- CreateIndex
CREATE UNIQUE INDEX "Message_channelMessageId_key" ON "Message"("channelMessageId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageThread_channelThreadId_key" ON "MessageThread"("channelThreadId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageThread_guestId_listingId_channel_key" ON "MessageThread"("guestId", "listingId", "channel");
