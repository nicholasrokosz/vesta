-- DropForeignKey
ALTER TABLE "ListingExpense" DROP CONSTRAINT "ListingExpense_ownerStatementId_fkey";

-- AlterTable
ALTER TABLE "ListingExpense" ALTER COLUMN "ownerStatementId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ListingExpense" ADD CONSTRAINT "ListingExpense_ownerStatementId_fkey" FOREIGN KEY ("ownerStatementId") REFERENCES "OwnerStatement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
