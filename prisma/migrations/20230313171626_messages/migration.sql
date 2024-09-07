-- CreateEnum
CREATE TYPE "MessageUser" AS ENUM ('GUEST', 'PROPERTY_MANAGER');

-- CreateTable
CREATE TABLE "MessageThread" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "lastMessageSentAt" TIMESTAMP(3) NOT NULL,
    "lastMessageText" TEXT NOT NULL,
    "channelThreadId" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'airbnb',
    "channelABB" TEXT NOT NULL DEFAULT 'ABB',
    "guestName" TEXT NOT NULL,
    "guestEmail" TEXT,
    "fromDate" TIMESTAMP(3) NOT NULL,
    "toDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "messageThreadId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "message" TEXT NOT NULL,
    "user" "MessageUser" NOT NULL,
    "channelMessageId" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MessageThread" ADD CONSTRAINT "MessageThread_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageThread" ADD CONSTRAINT "MessageThread_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_messageThreadId_fkey" FOREIGN KEY ("messageThreadId") REFERENCES "MessageThread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
