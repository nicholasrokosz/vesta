-- AlterEnum
ALTER TYPE "Channel" ADD VALUE 'Booking';

-- AlterTable
ALTER TABLE "Reservation" ALTER COLUMN "channel" SET DEFAULT 'Direct';
