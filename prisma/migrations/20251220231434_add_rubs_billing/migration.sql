-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "type" TEXT,
    "units" INTEGER NOT NULL DEFAULT 1,
    "ownerId" TEXT,
    "ownerName" TEXT,
    "ownerEmail" TEXT,
    "ownerPhone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "leaseStartDate" DATETIME,
    "leaseEndDate" DATETIME,
    "rentAmount" REAL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "apartmentNumber" TEXT,
    "squareFootage" REAL,
    "numberOfOccupants" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Tenant_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "fileUrl" TEXT,
    "expirationDate" DATETIME,
    "uploadedAt" DATETIME,
    "extractedData" TEXT,
    "confidence" REAL,
    "processingStatus" TEXT NOT NULL DEFAULT 'pending',
    "thumbnailUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Document_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ComplianceItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT,
    "tenantId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ComplianceItem_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ComplianceItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommunicationLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunicationLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkflowExecution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workflowType" TEXT NOT NULL,
    "tenantId" TEXT,
    "propertyId" TEXT,
    "status" TEXT NOT NULL,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" DATETIME,
    "nextAttemptAt" DATETIME,
    "metadata" JSONB,
    "result" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UtilityBill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "billingPeriod" TEXT NOT NULL,
    "utilityType" TEXT NOT NULL DEFAULT 'total',
    "totalCost" REAL NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TenantUtilityCharge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "utilityBillId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "chargeAmount" REAL NOT NULL,
    "squareFootageRatio" REAL NOT NULL,
    "occupancyRatio" REAL NOT NULL,
    "squareFootageCost" REAL NOT NULL,
    "occupancyCost" REAL NOT NULL,
    "tenantSquareFootage" REAL NOT NULL,
    "tenantOccupants" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TenantUtilityCharge_utilityBillId_fkey" FOREIGN KEY ("utilityBillId") REFERENCES "UtilityBill" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TenantUtilityCharge_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Property_ownerId_idx" ON "Property"("ownerId");

-- CreateIndex
CREATE INDEX "Tenant_propertyId_idx" ON "Tenant"("propertyId");

-- CreateIndex
CREATE INDEX "Tenant_status_idx" ON "Tenant"("status");

-- CreateIndex
CREATE INDEX "Document_tenantId_idx" ON "Document"("tenantId");

-- CreateIndex
CREATE INDEX "Document_status_idx" ON "Document"("status");

-- CreateIndex
CREATE INDEX "Document_type_idx" ON "Document"("type");

-- CreateIndex
CREATE INDEX "ComplianceItem_propertyId_idx" ON "ComplianceItem"("propertyId");

-- CreateIndex
CREATE INDEX "ComplianceItem_tenantId_idx" ON "ComplianceItem"("tenantId");

-- CreateIndex
CREATE INDEX "ComplianceItem_status_idx" ON "ComplianceItem"("status");

-- CreateIndex
CREATE INDEX "ComplianceItem_dueDate_idx" ON "ComplianceItem"("dueDate");

-- CreateIndex
CREATE INDEX "CommunicationLog_tenantId_idx" ON "CommunicationLog"("tenantId");

-- CreateIndex
CREATE INDEX "CommunicationLog_channel_idx" ON "CommunicationLog"("channel");

-- CreateIndex
CREATE INDEX "CommunicationLog_createdAt_idx" ON "CommunicationLog"("createdAt");

-- CreateIndex
CREATE INDEX "WorkflowExecution_workflowType_idx" ON "WorkflowExecution"("workflowType");

-- CreateIndex
CREATE INDEX "WorkflowExecution_status_idx" ON "WorkflowExecution"("status");

-- CreateIndex
CREATE INDEX "WorkflowExecution_tenantId_idx" ON "WorkflowExecution"("tenantId");

-- CreateIndex
CREATE INDEX "WorkflowExecution_nextAttemptAt_idx" ON "WorkflowExecution"("nextAttemptAt");

-- CreateIndex
CREATE INDEX "UtilityBill_propertyId_idx" ON "UtilityBill"("propertyId");

-- CreateIndex
CREATE INDEX "UtilityBill_billingPeriod_idx" ON "UtilityBill"("billingPeriod");

-- CreateIndex
CREATE INDEX "UtilityBill_status_idx" ON "UtilityBill"("status");

-- CreateIndex
CREATE INDEX "TenantUtilityCharge_utilityBillId_idx" ON "TenantUtilityCharge"("utilityBillId");

-- CreateIndex
CREATE INDEX "TenantUtilityCharge_tenantId_idx" ON "TenantUtilityCharge"("tenantId");
