/*
  Warnings:

  - The `channel` column on the `Reservation` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Channel" AS ENUM ('Airbnb', 'VRBO', 'Direct', 'Manual');

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "channel",
ADD COLUMN     "channel" "Channel" NOT NULL DEFAULT 'Airbnb';
