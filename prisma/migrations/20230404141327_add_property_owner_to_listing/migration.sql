-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "propertyOwnerId" TEXT;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_propertyOwnerId_fkey" FOREIGN KEY ("propertyOwnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
