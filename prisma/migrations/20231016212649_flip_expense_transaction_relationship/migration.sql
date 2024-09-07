/*
  Warnings:

  - You are about to drop the column `expenseId` on the `PlaidTransaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[plaidTransactionId]` on the table `Expense` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "PlaidTransaction" DROP CONSTRAINT "PlaidTransaction_expenseId_fkey";

-- DropIndex
DROP INDEX "PlaidTransaction_expenseId_key";

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "plaidTransactionId" TEXT;

-- AlterTable
ALTER TABLE "PlaidTransaction" DROP COLUMN "expenseId";

-- CreateIndex
CREATE UNIQUE INDEX "Expense_plaidTransactionId_key" ON "Expense"("plaidTransactionId");

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_plaidTransactionId_fkey" FOREIGN KEY ("plaidTransactionId") REFERENCES "PlaidTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
