-- AlterTable
ALTER TABLE "OwnerStatement" ALTER COLUMN "locked" SET DEFAULT true;

-- AlterTable
ALTER TABLE "Revenue" ADD COLUMN     "ownerStatementId" TEXT;

-- AddForeignKey
ALTER TABLE "Revenue" ADD CONSTRAINT "Revenue_ownerStatementId_fkey" FOREIGN KEY ("ownerStatementId") REFERENCES "OwnerStatement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
