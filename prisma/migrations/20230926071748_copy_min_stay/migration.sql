UPDATE "DailyRate"
	SET "minStay"=subquery."minStay"
	FROM (SELECT "listingId", "minStay" FROM "Availability") AS subquery
	WHERE "DailyRate"."listingId" = subquery."listingId";

UPDATE "Pricing"
	SET "minStay"=subquery."minStay", "maxStay"=subquery."maxStay"
	FROM (SELECT "listingId", "minStay", "maxStay" FROM "Availability") AS subquery
	WHERE "Pricing"."listingId" = subquery."listingId"
