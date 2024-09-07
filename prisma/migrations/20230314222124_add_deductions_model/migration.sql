-- CreateTable
CREATE TABLE "Deductions" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "channelFees" BOOLEAN NOT NULL,
    "creditCardFees" BOOLEAN NOT NULL,
    "discounts" BOOLEAN NOT NULL,
    "municipalTaxes" BOOLEAN NOT NULL,
    "countyTaxes" BOOLEAN NOT NULL,
    "stateTaxes" BOOLEAN NOT NULL,
    "otherGuestFees" BOOLEAN NOT NULL,
    "pmcShare" INTEGER,

    CONSTRAINT "Deductions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Deductions_listingId_key" ON "Deductions"("listingId");

-- AddForeignKey
ALTER TABLE "Deductions" ADD CONSTRAINT "Deductions_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
