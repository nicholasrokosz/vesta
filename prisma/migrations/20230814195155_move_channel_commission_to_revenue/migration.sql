-- AlterTable
ALTER TABLE "Revenue" ADD COLUMN     "channelCommission" DOUBLE PRECISION;

UPDATE "Revenue"
SET "channelCommission" = "RevenueFee"."value"
FROM "RevenueFee"
WHERE "Revenue"."id" = "RevenueFee"."revenueId" AND "RevenueFee"."type" = 'Channel';
