/*
  Warnings:

  - You are about to drop the column `messageThreadId` on the `Reservation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_messageThreadId_fkey";

-- DropIndex
DROP INDEX "Reservation_messageThreadId_key";

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "messageThreadId";
