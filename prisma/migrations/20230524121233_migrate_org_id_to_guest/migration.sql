-- This is an empty migration.UPDATE "Guest"

UPDATE "Guest"
SET "organizationId" = (
  SELECT l."organizationId"
  FROM "Listing" AS l
  INNER JOIN "MessageThread" AS mt ON mt."listingId" = l."id"
  WHERE mt."guestId" = "Guest"."id"
  LIMIT 1
);
