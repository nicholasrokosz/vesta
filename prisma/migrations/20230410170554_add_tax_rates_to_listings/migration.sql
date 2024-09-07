-- CreateTable
CREATE TABLE "TaxRates" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "municipal" DOUBLE PRECISION,
    "county" DOUBLE PRECISION,
    "state" DOUBLE PRECISION,

    CONSTRAINT "TaxRates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaxRates_listingId_key" ON "TaxRates"("listingId");

-- AddForeignKey
ALTER TABLE "TaxRates" ADD CONSTRAINT "TaxRates_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
