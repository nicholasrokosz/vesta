/*
  Warnings:

  - Added the required column `taxable` to the `RevenueFee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RevenueFee" ADD COLUMN     "taxable" BOOLEAN NOT NULL default true;
