/*
  Warnings:

  - A unique constraint covering the columns `[email,organizationId]` on the table `Guest` will be added. If there are existing duplicate values, this will fail.
  - Made the column `organizationId` on table `Guest` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Guest" ALTER COLUMN "organizationId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Guest_email_organizationId_key" ON "Guest"("email", "organizationId");

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
