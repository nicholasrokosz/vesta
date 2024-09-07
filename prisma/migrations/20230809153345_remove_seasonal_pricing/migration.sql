/*
  Warnings:

  - You are about to drop the column `fall` on the `Pricing` table. All the data in the column will be lost.
  - You are about to drop the column `spring` on the `Pricing` table. All the data in the column will be lost.
  - You are about to drop the column `summer` on the `Pricing` table. All the data in the column will be lost.
  - You are about to drop the column `winter` on the `Pricing` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Pricing" DROP COLUMN "fall",
DROP COLUMN "spring",
DROP COLUMN "summer",
DROP COLUMN "winter";
