-- CreateTable
CREATE TABLE "PractitionerService" (
    "practitionerId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PractitionerService_pkey" PRIMARY KEY ("practitionerId","serviceId")
);

-- CreateIndex
CREATE INDEX "PractitionerService_serviceId_idx" ON "PractitionerService"("serviceId");

-- AddForeignKey
ALTER TABLE "PractitionerService" ADD CONSTRAINT "PractitionerService_practitionerId_fkey" FOREIGN KEY ("practitionerId") REFERENCES "Practitioner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PractitionerService" ADD CONSTRAINT "PractitionerService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: existing doctors can perform every service in the same business
INSERT INTO "PractitionerService" ("practitionerId", "serviceId", "createdAt")
SELECT p."id", s."id", CURRENT_TIMESTAMP
FROM "Practitioner" p
INNER JOIN "Service" s ON s."businessId" = p."businessId";

-- AlterTable
ALTER TABLE "CrmBooking" ADD COLUMN "serviceId" TEXT;

-- CreateIndex
CREATE INDEX "CrmBooking_serviceId_idx" ON "CrmBooking"("serviceId");

-- AddForeignKey
ALTER TABLE "CrmBooking" ADD CONSTRAINT "CrmBooking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill booking.serviceId by catalog name in the same business
UPDATE "CrmBooking" AS b
SET "serviceId" = s."id"
FROM "Service" AS s
WHERE b."serviceId" IS NULL
  AND s."businessId" = b."businessId"
  AND s."name" = b."service";
