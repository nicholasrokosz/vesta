/*
  Warnings:

  - Added the required column `bodyHtml` to the `MessageTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MessageTemplate" ADD COLUMN     "bodyHtml" TEXT NOT NULL;
