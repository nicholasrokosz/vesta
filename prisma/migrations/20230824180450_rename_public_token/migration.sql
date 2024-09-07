/*
  Warnings:

  - You are about to drop the column `publicToken` on the `PlaidItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[accessToken]` on the table `PlaidItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accessToken` to the `PlaidItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "PlaidItem_publicToken_key";

-- AlterTable
ALTER TABLE "PlaidItem" DROP COLUMN "publicToken",
ADD COLUMN     "accessToken" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PlaidItem_accessToken_key" ON "PlaidItem"("accessToken");
