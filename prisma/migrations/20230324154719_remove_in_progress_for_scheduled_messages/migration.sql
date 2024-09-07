/*
  Warnings:

  - The values [IN_PROGRESS] on the enum `ScheduledMessageStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ScheduledMessageStatus_new" AS ENUM ('PENDING', 'SENT', 'FAILED');
ALTER TABLE "ScheduledMessage" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ScheduledMessage" ALTER COLUMN "status" TYPE "ScheduledMessageStatus_new" USING ("status"::text::"ScheduledMessageStatus_new");
ALTER TYPE "ScheduledMessageStatus" RENAME TO "ScheduledMessageStatus_old";
ALTER TYPE "ScheduledMessageStatus_new" RENAME TO "ScheduledMessageStatus";
DROP TYPE "ScheduledMessageStatus_old";
ALTER TABLE "ScheduledMessage" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
