/*
  Warnings:

  - A unique constraint covering the columns `[replyTo]` on the table `MessageThread` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "MessageThread" ADD COLUMN     "replyTo" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "MessageThread_replyTo_key" ON "MessageThread"("replyTo");
