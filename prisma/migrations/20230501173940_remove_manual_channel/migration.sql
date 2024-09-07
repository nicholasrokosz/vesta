/*
  Warnings:

  - The values [Manual] on the enum `Channel` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
UPDATE "Reservation" SET "channel" = 'Direct' WHERE "channel" = 'Manual';
CREATE TYPE "Channel_new" AS ENUM ('Airbnb', 'Booking', 'VRBO', 'Direct');
ALTER TABLE "Reservation" ALTER COLUMN "channel" DROP DEFAULT;
ALTER TABLE "Reservation" ALTER COLUMN "channel" TYPE "Channel_new" USING ("channel"::text::"Channel_new");
ALTER TYPE "Channel" RENAME TO "Channel_old";
ALTER TYPE "Channel_new" RENAME TO "Channel";
DROP TYPE "Channel_old";
ALTER TABLE "Reservation" ALTER COLUMN "channel" SET DEFAULT 'Direct';
COMMIT;
