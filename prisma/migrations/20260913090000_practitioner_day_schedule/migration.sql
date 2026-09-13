-- Flexible per-day doctor availability (hours / day off)

CREATE TABLE "PractitionerDaySchedule" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "practitionerId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "startTime" TEXT NOT NULL DEFAULT '09:00',
    "endTime" TEXT NOT NULL DEFAULT '17:00',
    "isOff" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PractitionerDaySchedule_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PractitionerDaySchedule_practitionerId_date_key" ON "PractitionerDaySchedule"("practitionerId", "date");
CREATE INDEX "PractitionerDaySchedule_businessId_date_idx" ON "PractitionerDaySchedule"("businessId", "date");
CREATE INDEX "PractitionerDaySchedule_practitionerId_date_idx" ON "PractitionerDaySchedule"("practitionerId", "date");

ALTER TABLE "PractitionerDaySchedule" ADD CONSTRAINT "PractitionerDaySchedule_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PractitionerDaySchedule" ADD CONSTRAINT "PractitionerDaySchedule_practitionerId_fkey" FOREIGN KEY ("practitionerId") REFERENCES "Practitioner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
