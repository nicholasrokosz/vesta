/*
  Warnings:

  - You are about to drop the column `grossRevenue` on the `Revenue` table. All the data in the column will be lost.
  - You are about to drop the column `netRevenue` on the `Revenue` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Revenue" DROP COLUMN "grossRevenue",
DROP COLUMN "netRevenue",
ALTER COLUMN "accomodation" DROP DEFAULT;
