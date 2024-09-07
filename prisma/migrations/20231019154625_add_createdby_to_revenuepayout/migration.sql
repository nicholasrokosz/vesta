-- AlterTable
ALTER TABLE "RevenuePayout" ADD COLUMN     "createdById" TEXT;

-- AddForeignKey
ALTER TABLE "RevenuePayout" ADD CONSTRAINT "RevenuePayout_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
