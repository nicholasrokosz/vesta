/*
  Warnings:

  - A unique constraint covering the columns `[listingId,month,year]` on the table `OwnerStatement` will be added. If there are existing duplicate values, this will fail.
  - Made the column `ownerStatementId` on table `Expense` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `year` to the `OwnerStatement` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `month` on the `OwnerStatement` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_ownerStatementId_fkey";

-- AlterTable
ALTER TABLE "Expense" ALTER COLUMN "ownerStatementId" SET NOT NULL;

-- AlterTable
ALTER TABLE "OwnerStatement" ADD COLUMN     "year" INTEGER NOT NULL,
DROP COLUMN "month",
ADD COLUMN     "month" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "OwnerStatement_listingId_month_year_key" ON "OwnerStatement"("listingId", "month", "year");

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_ownerStatementId_fkey" FOREIGN KEY ("ownerStatementId") REFERENCES "OwnerStatement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
