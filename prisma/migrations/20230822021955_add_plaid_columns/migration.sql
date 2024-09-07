/*
  Warnings:

  - A unique constraint covering the columns `[plaidId]` on the table `PlaidAccount` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `plaidId` to the `PlaidAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plaidId` to the `PlaidTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlaidAccount" ADD COLUMN     "plaidId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PlaidItem" ADD COLUMN     "cursor" TEXT;

-- AlterTable
ALTER TABLE "PlaidTransaction" ADD COLUMN     "plaidId" TEXT NOT NULL,
ALTER COLUMN "vendor" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PlaidAccount_plaidId_key" ON "PlaidAccount"("plaidId");
