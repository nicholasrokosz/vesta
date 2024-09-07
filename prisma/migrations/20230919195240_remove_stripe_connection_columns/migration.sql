/*
  Warnings:

  - You are about to drop the column `chargesEnabled` on the `StripeConnection` table. All the data in the column will be lost.
  - You are about to drop the column `transfersEnabled` on the `StripeConnection` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StripeConnection" DROP COLUMN "chargesEnabled",
DROP COLUMN "transfersEnabled";
