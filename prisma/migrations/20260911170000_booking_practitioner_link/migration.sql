-- AlterTable
ALTER TABLE "CrmBooking" ADD COLUMN "practitionerId" TEXT,
ADD COLUMN "googleEventId" TEXT,
ADD COLUMN "notes" TEXT;

-- CreateIndex
CREATE INDEX "CrmBooking_practitionerId_scheduledAt_idx" ON "CrmBooking"("practitionerId", "scheduledAt");

-- AddForeignKey
ALTER TABLE "CrmBooking" ADD CONSTRAINT "CrmBooking_practitionerId_fkey" FOREIGN KEY ("practitionerId") REFERENCES "Practitioner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
