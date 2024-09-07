-- RenameTable
ALTER TABLE "Rate" RENAME TO "RevenueRate";

-- RenameTable
ALTER TABLE "Tax" RENAME TO "RevenueTax";

-- AlterTable
ALTER TABLE "RevenueRate" RENAME CONSTRAINT "Rate_pkey" TO "RevenueRate_pkey";

-- AlterTable
ALTER TABLE "RevenueTax" RENAME CONSTRAINT "Tax_pkey" TO "RevenueTax_pkey";

-- RenameForeignKey
ALTER TABLE "RevenueRate" RENAME CONSTRAINT "Rate_revenueId_fkey" TO "RevenueRate_revenueId_fkey";

-- RenameForeignKey
ALTER TABLE "RevenueTax" RENAME CONSTRAINT "Tax_revenueFeeId_fkey" TO "RevenueTax_revenueFeeId_fkey";

-- RenameForeignKey
ALTER TABLE "RevenueTax" RENAME CONSTRAINT "Tax_revenueId_fkey" TO "RevenueTax_revenueId_fkey";
