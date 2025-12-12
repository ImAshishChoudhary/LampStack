-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL,
    "npiNumber" TEXT NOT NULL,
    "currentVersion" INTEGER NOT NULL DEFAULT 1,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT,
    "credentials" TEXT,
    "primaryPhone" TEXT,
    "secondaryPhone" TEXT,
    "email" TEXT,
    "faxNumber" TEXT,
    "practiceAddress" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'USA',
    "specialties" TEXT[],
    "taxonomyCode" TEXT,
    "licenseNumbers" TEXT[],
    "insuranceNetworks" TEXT[],
    "hospitalAffiliations" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastValidated" TIMESTAMP(3),
    "overallConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderVersion" (
    "id" SERIAL NOT NULL,
    "providerId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "changedFields" TEXT[],
    "changeSource" TEXT NOT NULL,
    "changeReason" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValidationResult" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "agentName" TEXT NOT NULL,
    "validationType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "sourceUrl" TEXT,
    "sourceType" TEXT NOT NULL,
    "apiResponse" JSONB,
    "foundIssues" TEXT[],
    "suggestedFixes" JSONB,
    "validatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ValidationResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrustScore" (
    "id" SERIAL NOT NULL,
    "sourceType" TEXT NOT NULL,
    "dataField" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "totalValidations" INTEGER NOT NULL DEFAULT 0,
    "learningRate" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrustScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HumanFeedback" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "reviewerEmail" TEXT NOT NULL,
    "reviewerName" TEXT,
    "fieldName" TEXT NOT NULL,
    "originalValue" TEXT,
    "correctedValue" TEXT,
    "feedbackType" TEXT NOT NULL,
    "affectedSource" TEXT,
    "trustImpact" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HumanFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValidationJob" (
    "id" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalProviders" INTEGER NOT NULL DEFAULT 0,
    "processedProviders" INTEGER NOT NULL DEFAULT 0,
    "successfulCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "estimatedDuration" INTEGER,
    "summary" JSONB,
    "errorLog" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ValidationJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Provider_npiNumber_key" ON "Provider"("npiNumber");

-- CreateIndex
CREATE INDEX "Provider_npiNumber_idx" ON "Provider"("npiNumber");

-- CreateIndex
CREATE INDEX "Provider_state_city_idx" ON "Provider"("state", "city");

-- CreateIndex
CREATE INDEX "Provider_lastValidated_idx" ON "Provider"("lastValidated");

-- CreateIndex
CREATE INDEX "ProviderVersion_providerId_createdAt_idx" ON "ProviderVersion"("providerId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderVersion_providerId_versionNumber_key" ON "ProviderVersion"("providerId", "versionNumber");

-- CreateIndex
CREATE INDEX "ValidationResult_providerId_validatedAt_idx" ON "ValidationResult"("providerId", "validatedAt");

-- CreateIndex
CREATE INDEX "ValidationResult_agentName_status_idx" ON "ValidationResult"("agentName", "status");

-- CreateIndex
CREATE INDEX "TrustScore_sourceType_idx" ON "TrustScore"("sourceType");

-- CreateIndex
CREATE UNIQUE INDEX "TrustScore_sourceType_dataField_key" ON "TrustScore"("sourceType", "dataField");

-- CreateIndex
CREATE INDEX "HumanFeedback_providerId_createdAt_idx" ON "HumanFeedback"("providerId", "createdAt");

-- CreateIndex
CREATE INDEX "HumanFeedback_reviewerEmail_idx" ON "HumanFeedback"("reviewerEmail");

-- CreateIndex
CREATE INDEX "ValidationJob_status_createdAt_idx" ON "ValidationJob"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "ProviderVersion" ADD CONSTRAINT "ProviderVersion_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValidationResult" ADD CONSTRAINT "ValidationResult_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HumanFeedback" ADD CONSTRAINT "HumanFeedback_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
