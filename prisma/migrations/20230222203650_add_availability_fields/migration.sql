/*
  Warnings:

  - Added the required column `noCheckinDays` to the `Availability` table without a default value. This is not possible if the table is not empty.
  - Added the required column `noCheckoutDays` to the `Availability` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Availability" ADD COLUMN     "noCheckinDays" TEXT NOT NULL,
ADD COLUMN     "noCheckoutDays" TEXT NOT NULL;
