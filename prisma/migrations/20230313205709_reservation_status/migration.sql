-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('CANCELLED', 'CONFIRMED', 'FULLY_PAID', 'PROVISIONAL', 'EXCEPTION', 'FAILED');

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "status" "ReservationStatus" NOT NULL DEFAULT 'PROVISIONAL';
