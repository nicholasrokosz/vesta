WITH "InsertedFees" AS (
    -- Insert into RevenueFee and return the new ids and revenueId
    INSERT INTO "RevenueFee" ("id", "revenueId", "createdAt", "updatedAt", "name", "value", "unit", "pmcShare", "taxable", "type")
    SELECT
        gen_random_uuid(),
        "id",
        NOW(),
        NOW(),
        'Accommodation revenue',
        "accommodation",
        'PerStay',
        "pmcShare",
        true,
        'ACCOMMODATION'
    FROM "Revenue"
    RETURNING "id", "revenueId" -- This assumes a PostgreSQL syntax for returning inserted values. Adjust for your DBMS.
)

UPDATE "RevenueTax"
SET "revenueFeeId" = "InsertedFees"."id"
FROM "InsertedFees"
WHERE "RevenueTax"."revenueId" = "InsertedFees"."revenueId"
AND "RevenueTax"."revenueFeeId" IS NULL;



/*
  Warnings:

  - Made the column `revenueFeeId` on table `RevenueTax` required. This step will fail if there are existing NULL values in that column.

*/

-- RevenueTax is required to only connect to RevenueFee now. Below is removing constraints so these columns can be dropped in a following PR

-- Enforce RevenueTax only connects  to RevenueFee now
ALTER TABLE "RevenueTax" ALTER COLUMN "revenueId" DROP NOT NULL;
ALTER TABLE "RevenueTax" DROP CONSTRAINT "RevenueTax_revenueFeeId_fkey";
ALTER TABLE "RevenueTax" DROP CONSTRAINT "RevenueTax_revenueId_fkey";

-- Accommodation is now in RevenueFee (soon to be RevenueEntry)
ALTER TABLE "Revenue" ALTER COLUMN "accommodation" DROP NOT NULL;

-- Enforce RevenueTax always connects to RevenueFee
ALTER TABLE "RevenueTax" ALTER COLUMN "revenueFeeId" SET NOT NULL;
ALTER TABLE "RevenueTax" ADD CONSTRAINT "RevenueTax_revenueFeeId_fkey" FOREIGN KEY ("revenueFeeId") REFERENCES "RevenueFee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
