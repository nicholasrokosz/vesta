-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "timeZone" TEXT NOT NULL DEFAULT 'US/Eastern';
ALTER TABLE "Listing" ALTER COLUMN "timeZone" DROP DEFAULT;
