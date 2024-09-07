/*
  Warnings:

  - A unique constraint covering the columns `[organizationId]` on the table `PriceLabsConnection` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PriceLabsConnection" ADD COLUMN     "organizationId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PriceLabsConnection_organizationId_key" ON "PriceLabsConnection"("organizationId");

-- AddForeignKey
ALTER TABLE "PriceLabsConnection" ADD CONSTRAINT "PriceLabsConnection_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
