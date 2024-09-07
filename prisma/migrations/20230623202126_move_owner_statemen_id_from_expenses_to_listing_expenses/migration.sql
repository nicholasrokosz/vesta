/*
  Warnings:

  - You are about to drop the column `ownerStatementId` on the `Expense` table. All the data in the column will be lost.
  - Added the required column `ownerStatementId` to the `ListingExpense` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_ownerStatementId_fkey";

-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "ownerStatementId";

-- AlterTable
ALTER TABLE "ListingExpense" ADD COLUMN     "ownerStatementId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ListingExpense" ADD CONSTRAINT "ListingExpense_ownerStatementId_fkey" FOREIGN KEY ("ownerStatementId") REFERENCES "OwnerStatement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
