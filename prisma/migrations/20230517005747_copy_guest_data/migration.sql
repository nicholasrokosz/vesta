-- Create Guest entries based on existing Reservations
WITH new_guests AS (
  INSERT INTO "Guest" ("id", "createdAt", "updatedAt", "name", "email", "phone")
  SELECT gen_random_uuid(), "createdAt", "updatedAt", "name", "email", "phone" FROM "Reservation"
  RETURNING *
),
temp_id_mapping AS (
  SELECT "Reservation"."id" AS reservationId, new_guests."id" AS guestId
  FROM "Reservation"
  JOIN new_guests ON "Reservation"."name" = new_guests."name" AND "Reservation"."email" = new_guests."email"
)
UPDATE "Reservation"
SET "guestId" = temp_id_mapping.guestId
FROM temp_id_mapping
WHERE "Reservation"."id" = temp_id_mapping.reservationId;
