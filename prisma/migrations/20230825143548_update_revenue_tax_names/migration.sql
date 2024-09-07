-- This is an empty migration.

UPDATE "RevenueTax" SET "description" = 'Municipal tax' WHERE "description" = 'Municipal taxes';
UPDATE "RevenueTax" SET "description" = 'County tax' WHERE "description" = 'County taxes';
UPDATE "RevenueTax" SET "description" = 'State tax' WHERE "description" = 'State taxes';
