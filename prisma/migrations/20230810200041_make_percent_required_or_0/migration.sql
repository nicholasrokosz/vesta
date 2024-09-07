
UPDATE "Discount" SET "percent" = 0 WHERE "percent" IS NULL;
ALTER TABLE "Discount" ALTER COLUMN "percent" SET NOT NULL,
ALTER COLUMN "percent" SET DEFAULT 0;
