-- CreateEnum
CREATE TYPE "ContactLifecycle" AS ENUM ('NEW_LEAD', 'CONTACTED', 'INTERESTED', 'BOOKED', 'CUSTOMER', 'RETURNING', 'INACTIVE', 'LOST');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('WHATSAPP', 'INSTAGRAM', 'WEBSITE', 'REFERRAL', 'OTHER');

-- CreateEnum
CREATE TYPE "ContactGender" AS ENUM ('FEMALE', 'MALE', 'OTHER', 'UNSPECIFIED');

-- CreateEnum
CREATE TYPE "FollowUpType" AS ENUM ('BOOKING', 'REMINDER', 'POST_SERVICE', 'PROMO', 'UNREPLIED', 'NO_BOOKING', 'CUSTOM');

-- CreateEnum
CREATE TYPE "FollowUpStatus" AS ENUM ('PENDING', 'DONE', 'SKIPPED');

-- CreateEnum
CREATE TYPE "CrmBookingStatus" AS ENUM ('BOOKED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- AlterTable
ALTER TABLE "Contact"
ADD COLUMN "email" TEXT,
ADD COLUMN "gender" "ContactGender" NOT NULL DEFAULT 'UNSPECIFIED',
ADD COLUMN "birthDate" TIMESTAMP(3),
ADD COLUMN "source" "LeadSource" NOT NULL DEFAULT 'WHATSAPP',
ADD COLUMN "lifecycle" "ContactLifecycle" NOT NULL DEFAULT 'NEW_LEAD',
ADD COLUMN "assignedStaff" TEXT,
ADD COLUMN "potentialValue" INTEGER,
ADD COLUMN "nextFollowUpAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Contact_businessId_lifecycle_idx" ON "Contact"("businessId", "lifecycle");

-- CreateIndex
CREATE INDEX "Contact_businessId_nextFollowUpAt_idx" ON "Contact"("businessId", "nextFollowUpAt");

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'primary',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactTag" (
    "contactId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactTag_pkey" PRIMARY KEY ("contactId","tagId")
);

-- CreateTable
CREATE TABLE "ContactNote" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "authorId" TEXT,
    "authorName" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactFollowUp" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "type" "FollowUpType" NOT NULL DEFAULT 'CUSTOM',
    "status" "FollowUpStatus" NOT NULL DEFAULT 'PENDING',
    "dueAt" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactFollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmBooking" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "staffName" TEXT,
    "status" "CrmBookingStatus" NOT NULL DEFAULT 'BOOKED',
    "amount" INTEGER NOT NULL DEFAULT 0,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Tag_businessId_idx" ON "Tag"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_businessId_name_key" ON "Tag"("businessId", "name");

-- CreateIndex
CREATE INDEX "ContactTag_tagId_idx" ON "ContactTag"("tagId");

-- CreateIndex
CREATE INDEX "ContactNote_contactId_createdAt_idx" ON "ContactNote"("contactId", "createdAt");

-- CreateIndex
CREATE INDEX "ContactFollowUp_contactId_dueAt_idx" ON "ContactFollowUp"("contactId", "dueAt");

-- CreateIndex
CREATE INDEX "ContactFollowUp_status_dueAt_idx" ON "ContactFollowUp"("status", "dueAt");

-- CreateIndex
CREATE INDEX "CrmBooking_businessId_scheduledAt_idx" ON "CrmBooking"("businessId", "scheduledAt");

-- CreateIndex
CREATE INDEX "CrmBooking_contactId_scheduledAt_idx" ON "CrmBooking"("contactId", "scheduledAt");

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactTag" ADD CONSTRAINT "ContactTag_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactTag" ADD CONSTRAINT "ContactTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactNote" ADD CONSTRAINT "ContactNote_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactFollowUp" ADD CONSTRAINT "ContactFollowUp_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmBooking" ADD CONSTRAINT "CrmBooking_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmBooking" ADD CONSTRAINT "CrmBooking_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
