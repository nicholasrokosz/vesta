-- CreateEnum
CREATE TYPE "DynamicPricing" AS ENUM ('None', 'PriceLabs');

-- AlterTable
ALTER TABLE "Pricing" ADD COLUMN     "dynamicPricing" "DynamicPricing" NOT NULL DEFAULT 'None';
