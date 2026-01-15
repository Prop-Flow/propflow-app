#!/bin/bash

# Script to import demo data into Firestore using Firebase CLI

echo "Importing demo data into Firestore..."

# Create Alex Rivera user document
npx firebase firestore:set users/MciPtCS843NeGNpDkU21eQr0EKn2 \
  --data '{
    "email": "demo-tenant@propflow.com",
    "firstName": "Alex",
    "lastName": "Rivera",
    "phone": "+15551234569",
    "role": "TENANT",
    "uid": "MciPtCS843NeGNpDkU21eQr0EKn2"
  }' \
  --project propflow-ai-483621

echo "✓ Created Alex Rivera user document"

# Create properties for Sarah Johnson (Owner)
npx firebase firestore:set users/g7FS978xSIZduRmw377lHOo8AU82/properties/sunset-apartments \
  --data '{
    "name": "Sunset Apartments",
    "address": "123 Main St, San Francisco, CA 94102",
    "type": "MULTI_FAMILY",
    "units": 12,
    "status": "ACTIVE",
    "purchasePrice": 2500000,
    "currentValue": 2800000,
    "monthlyIncome": 18000,
    "monthlyExpenses": 8500,
    "ownerId": "g7FS978xSIZduRmw377lHOo8AU82"
  }' \
  --project propflow-ai-483621

echo "✓ Created Sunset Apartments for Sarah"

npx firebase firestore:set users/g7FS978xSIZduRmw377lHOo8AU82/properties/downtown-office \
  --data '{
    "name": "Downtown Office Complex",
    "address": "456 Market St, San Francisco, CA 94103",
    "type": "COMMERCIAL",
    "units": 8,
    "status": "ACTIVE",
    "purchasePrice": 4200000,
    "currentValue": 4600000,
    "monthlyIncome": 32000,
    "monthlyExpenses": 15000,
    "ownerId": "g7FS978xSIZduRmw377lHOo8AU82"
  }' \
  --project propflow-ai-483621

echo "✓ Created Downtown Office Complex for Sarah"

# Create property for Mike Chen (Manager)
npx firebase firestore:set users/SFoyLi8r7dbM4YPFBVOP1Mgpyrq2/properties/riverside-condos \
  --data '{
    "name": "Riverside Condos",
    "address": "789 River Rd, Oakland, CA 94601",
    "type": "MULTI_FAMILY",
    "units": 24,
    "status": "ACTIVE",
    "purchasePrice": 3800000,
    "currentValue": 4100000,
    "monthlyIncome": 28000,
    "monthlyExpenses": 14000,
    "ownerId": "SFoyLi8r7dbM4YPFBVOP1Mgpyrq2"
  }' \
  --project propflow-ai-483621

echo "✓ Created Riverside Condos for Mike"

echo ""
echo "✅ Demo data import complete!"
echo ""
echo "Demo Accounts:"
echo "1. demo-owner@propflow.com (Sarah Johnson) - 2 properties"
echo "2. demo-manager@propflow.com (Mike Chen) - 1 property"
echo "3. demo-tenant@propflow.com (Alex Rivera) - 0 properties"
