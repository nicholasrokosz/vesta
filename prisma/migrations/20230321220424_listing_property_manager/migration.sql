/*
  Warnings:

  - Added the required column `propertyManagerId` to the `Listing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "propertyManagerId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_propertyManagerId_fkey" FOREIGN KEY ("propertyManagerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
