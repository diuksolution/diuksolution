-- Remap appointment statuses:
-- COMPLETED -> DONE, NO_SHOW -> CANCELLED
-- New system statuses: BOOKED, CANCELLED, DP, PAID, DONE

CREATE TYPE "CrmBookingStatus_new" AS ENUM ('BOOKED', 'CANCELLED', 'DP', 'PAID', 'DONE');

ALTER TABLE "CrmBooking" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "CrmBooking"
  ALTER COLUMN "status" TYPE "CrmBookingStatus_new"
  USING (
    CASE "status"::text
      WHEN 'COMPLETED' THEN 'DONE'
      WHEN 'NO_SHOW' THEN 'CANCELLED'
      ELSE "status"::text
    END
  )::"CrmBookingStatus_new";

ALTER TABLE "CrmBooking" ALTER COLUMN "status" SET DEFAULT 'BOOKED'::"CrmBookingStatus_new";

DROP TYPE "CrmBookingStatus";
ALTER TYPE "CrmBookingStatus_new" RENAME TO "CrmBookingStatus";
