/*
  Warnings:

  - You are about to drop the column `maxStay` on the `Availability` table. All the data in the column will be lost.
  - You are about to drop the column `minStay` on the `Availability` table. All the data in the column will be lost.
  - You are about to drop the column `noCheckinDays` on the `Availability` table. All the data in the column will be lost.
  - You are about to drop the column `noCheckoutDays` on the `Availability` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Availability" DROP COLUMN "maxStay",
DROP COLUMN "minStay",
DROP COLUMN "noCheckinDays",
DROP COLUMN "noCheckoutDays";

-- AlterTable
ALTER TABLE "Pricing" ALTER COLUMN "maxStay" DROP DEFAULT,
ALTER COLUMN "minStay" DROP DEFAULT;
