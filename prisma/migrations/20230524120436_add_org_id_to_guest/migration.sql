-- AlterTable
ALTER TABLE "Guest" ADD COLUMN     "organizationId" TEXT;
DROP INDEX "Guest_email_key";


