/*
  Warnings:

  - Made the column `pets` on table `Rules` required. This step will fail if there are existing NULL values in that column.
  - Made the column `children` on table `Rules` required. This step will fail if there are existing NULL values in that column.
  - Made the column `smoking` on table `Rules` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Rules" ALTER COLUMN "pets" SET NOT NULL,
ALTER COLUMN "pets" SET DEFAULT false,
ALTER COLUMN "children" SET NOT NULL,
ALTER COLUMN "children" SET DEFAULT false,
ALTER COLUMN "smoking" SET NOT NULL,
ALTER COLUMN "smoking" SET DEFAULT false;
