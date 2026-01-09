-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'TENANT',
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "passwordHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "propertyId" TEXT,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_PropertyManagers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_PropertyManagers_A_fkey" FOREIGN KEY ("A") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PropertyManagers_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Property" (
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
    "updatedAt" DATETIME NOT NULL,
    "buildingCode" TEXT,
    "ownerUserId" TEXT,
    CONSTRAINT "Property_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Property" ("address", "city", "createdAt", "id", "name", "ownerEmail", "ownerId", "ownerName", "ownerPhone", "state", "type", "units", "updatedAt", "zipCode") SELECT "address", "city", "createdAt", "id", "name", "ownerEmail", "ownerId", "ownerName", "ownerPhone", "state", "type", "units", "updatedAt", "zipCode" FROM "Property";
DROP TABLE "Property";
ALTER TABLE "new_Property" RENAME TO "Property";
CREATE UNIQUE INDEX "Property_buildingCode_key" ON "Property"("buildingCode");
CREATE INDEX "Property_ownerId_idx" ON "Property"("ownerId");
CREATE INDEX "Property_ownerUserId_idx" ON "Property"("ownerUserId");
CREATE TABLE "new_Tenant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "userId" TEXT,
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
    CONSTRAINT "Tenant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Tenant_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Tenant" ("apartmentNumber", "createdAt", "email", "id", "leaseEndDate", "leaseStartDate", "name", "numberOfOccupants", "phone", "propertyId", "rentAmount", "squareFootage", "status", "updatedAt") SELECT "apartmentNumber", "createdAt", "email", "id", "leaseEndDate", "leaseStartDate", "name", "numberOfOccupants", "phone", "propertyId", "rentAmount", "squareFootage", "status", "updatedAt" FROM "Tenant";
DROP TABLE "Tenant";
ALTER TABLE "new_Tenant" RENAME TO "Tenant";
CREATE UNIQUE INDEX "Tenant_userId_key" ON "Tenant"("userId");
CREATE INDEX "Tenant_propertyId_idx" ON "Tenant"("propertyId");
CREATE INDEX "Tenant_status_idx" ON "Tenant"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_token_key" ON "Invitation"("token");

-- CreateIndex
CREATE UNIQUE INDEX "_PropertyManagers_AB_unique" ON "_PropertyManagers"("A", "B");

-- CreateIndex
CREATE INDEX "_PropertyManagers_B_index" ON "_PropertyManagers"("B");
