/*
  Warnings:

  - You are about to drop the column `global_role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `organization_role` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" RENAME COLUMN "global_role" TO "globalRole";
ALTER TABLE "User" RENAME COLUMN "organization_role" TO "organizationRole";
