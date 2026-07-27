-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('MURS', 'FONDS', 'MURS_FONDS', 'GERANCE');

-- CreateEnum
CREATE TYPE "SaleIntention" AS ENUM ('LESS_THAN_1_YEAR', 'ONE_TO_TWO_YEARS', 'CURIOSITY');

-- CreateTable
CREATE TABLE "Estimation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "transactionType" "TransactionType" NOT NULL,
    "regionSlug" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "departmentSlug" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "city" TEXT,
    "roomCount" INTEGER NOT NULL,
    "starRating" INTEGER NOT NULL,
    "hasLicence4" BOOLEAN NOT NULL DEFAULT false,
    "revenueCents" INTEGER,
    "ebitdaCents" INTEGER,
    "valueLowCents" INTEGER NOT NULL,
    "valueHighCents" INTEGER NOT NULL,
    "methodNotes" TEXT NOT NULL,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "referrer" TEXT,
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Estimation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailLead" (
    "id" TEXT NOT NULL,
    "estimationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "saleIntention" "SaleIntention" NOT NULL,
    "consentContact" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoefficientValo" (
    "id" TEXT NOT NULL,
    "regionSlug" TEXT NOT NULL,
    "starRating" INTEGER NOT NULL,
    "ebitdaMultipleLow" DOUBLE PRECISION NOT NULL,
    "ebitdaMultipleHigh" DOUBLE PRECISION NOT NULL,
    "pricePerRoomLowCents" INTEGER NOT NULL,
    "pricePerRoomHighCents" INTEGER NOT NULL,
    "ebitdaMarginDefault" DOUBLE PRECISION NOT NULL DEFAULT 0.28,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoefficientValo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Estimation_createdAt_idx" ON "Estimation"("createdAt");

-- CreateIndex
CREATE INDEX "Estimation_regionSlug_idx" ON "Estimation"("regionSlug");

-- CreateIndex
CREATE INDEX "Estimation_departmentSlug_idx" ON "Estimation"("departmentSlug");

-- CreateIndex
CREATE UNIQUE INDEX "EmailLead_estimationId_key" ON "EmailLead"("estimationId");

-- CreateIndex
CREATE INDEX "EmailLead_saleIntention_idx" ON "EmailLead"("saleIntention");

-- CreateIndex
CREATE INDEX "EmailLead_createdAt_idx" ON "EmailLead"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CoefficientValo_regionSlug_starRating_key" ON "CoefficientValo"("regionSlug", "starRating");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_name_idx" ON "AnalyticsEvent"("name");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_sessionId_idx" ON "AnalyticsEvent"("sessionId");

-- AddForeignKey
ALTER TABLE "EmailLead" ADD CONSTRAINT "EmailLead_estimationId_fkey" FOREIGN KEY ("estimationId") REFERENCES "Estimation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
