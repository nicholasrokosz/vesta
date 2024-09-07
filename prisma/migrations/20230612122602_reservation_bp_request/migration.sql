-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "ReservationBpRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "fromDate" TIMESTAMP(3) NOT NULL,
    "toDate" TIMESTAMP(3) NOT NULL,
    "available" BOOLEAN NOT NULL,
    "status" "QueueStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "ReservationBpRequest_pkey" PRIMARY KEY ("id")
);
