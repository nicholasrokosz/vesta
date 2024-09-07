-- CreateEnum
CREATE TYPE "Trigger" AS ENUM ('CheckIn', 'CheckOut');

-- CreateEnum
CREATE TYPE "TriggerRange" AS ENUM ('Immediately', 'After', 'Before');

-- CreateEnum
CREATE TYPE "TriggerUnit" AS ENUM ('Minutes', 'Hours', 'Days');

-- AlterTable
ALTER TABLE "MessageTemplate" ADD COLUMN     "trigger" "Trigger",
ADD COLUMN     "triggerRange" "TriggerRange",
ADD COLUMN     "triggerUnit" "TriggerUnit",
ADD COLUMN     "triggerValue" INTEGER;
