/*
  Warnings:

  - You are about to drop the column `type` on the `RevenueFee` table. All the data in the column will be lost.

*/
-- Delete channel commission records that were migrated to "Revenue" in previous migration
DELETE FROM "RevenueFee" WHERE TYPE = 'Channel';

-- AlterTable
ALTER TABLE "RevenueFee" DROP COLUMN "type";

-- DropEnum
DROP TYPE "FeeType";
