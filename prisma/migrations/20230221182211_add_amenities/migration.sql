-- CreateTable
CREATE TABLE "Amenity" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "Amenity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Amenity" ADD CONSTRAINT "Amenity_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
