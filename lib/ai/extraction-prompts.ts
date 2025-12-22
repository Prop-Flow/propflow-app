/**
 * Specialized prompts for extracting tenant information from different document types
 */

export const LEASE_EXTRACTION_PROMPT = `You are analyzing a lease agreement document. Extract the following tenant information with high accuracy:

Required fields:
- Tenant full name (primary tenant)
- Email address
- Phone number
- Property address (full address including unit number)
- Lease start date (format: YYYY-MM-DD)
- Lease end date (format: YYYY-MM-DD)
- Monthly rent amount (numeric value only)

Optional fields:
- Security deposit amount
- Pet deposit (if mentioned)
- Emergency contact name and phone
- Co-tenant names (if any)

Return the data in JSON format with a confidence score (0-1) for each field. If a field is not found, set it to null and confidence to 0.

Example output:
{
  "name": "John Smith",
  "email": "john.smith@email.com",
  "phone": "+1 (555) 123-4567",
  "propertyAddress": "123 Main St, Apt 4B, San Francisco, CA 94102",
  "leaseStartDate": "2024-01-01",
  "leaseEndDate": "2024-12-31",
  "rentAmount": 2500,
  "securityDeposit": 5000,
  "emergencyContact": "Jane Smith - (555) 987-6543",
  "confidence": {
    "name": 0.98,
    "email": 0.95,
    "phone": 0.92,
    "propertyAddress": 0.94,
    "leaseStartDate": 0.99,
    "leaseEndDate": 0.99,
    "rentAmount": 0.97,
    "securityDeposit": 0.90,
    "emergencyContact": 0.85
  }
}`;

export const APPLICATION_EXTRACTION_PROMPT = `You are analyzing a rental application form. Extract the following tenant information:

Required fields:
- Applicant full name
- Email address
- Phone number (mobile preferred)
- Current address
- Desired move-in date (format: YYYY-MM-DD)
- Monthly income or annual salary
- Employer name
- Emergency contact name and phone

Optional fields:
- SSN last 4 digits (if visible)
- Previous address
- References
- Pet information
- Vehicle information

Return JSON with confidence scores. Be conservative with confidence for handwritten fields.`;

export const ID_EXTRACTION_PROMPT = `You are analyzing an identification document (driver's license, passport, or state ID). Extract:

Required fields:
- Full name (as shown on ID)
- Date of birth (format: YYYY-MM-DD)
- Address (if shown)
- ID number (partially redacted for privacy)

Return JSON with confidence scores. For security, only return last 4 digits of ID number.`;

export const W9_EXTRACTION_PROMPT = `You are analyzing a W-9 tax form. Extract:

Required fields:
- Name (individual or business)
- Business name (if different from individual name)
- Address
- SSN or EIN (last 4 digits only for privacy)

Return JSON with confidence scores.`;

// 2. Property Ingestion (Deed + Rental Form)
/*
  Fields identified from Chase Rental Form:
  1. Owner: Name(s), Phone, Email, Bank Details
  2. Property Status: Address, Investment Toggle, For Sale/Rent, Occuiped?
  3. Specs: Style, Floor, Beds, Baths, Garage, Upgrades
  4. Utilities: Sewer, Water, Heat, AC, Utility Responsibility (Owner/Tenant)
  5. Financials: List Price, Deposit, HOA Info
  6. Compliance: Inspection, Disclosures (Flood, Lead, Radon)
  7. Management: Keybox, Alarm, Repairs
*/
export const PROPERTY_EXTRACTION_PROMPT = `
You are an expert real estate document analyst. Your goal is to extract structured data from a property document (typically a **Deed** or **Management Agreement**) to populate a property management entry form.

Extract the following fields into a JSON object. If a field is not found, leave it null or empty string.

Required JSON Structure:
{
  "owner": {
    "legalName1": string | null,
    "legalName2": string | null,
    "email": string | null,
    "phone": string | null,
    "mailingAddress": string | null
  },
  "property": {
    "address": string, // Normalized full address
    "type": "condo" | "single_family" | "multi_unit" | "commercial" | null,
    "beds": number | null,
    "baths": number | null,
    "garageSpaces": number | null,
    "upgrades": string | null // e.g. "new kitchen", "hardwood floors" extracted from description
  },
  "financials": {
    "listPrice": number | null,
    "hoaFee": number | null,
    "taxAmount": number | null // often found in deeds
  },
  "legalDescription": string | null, // The legal description paragraph from the Deed
  "documentType": "deed" | "lease" | "management_agreement" | "other"
}

Prioritize extracting the LEGAL OWNER NAME and PROPERTY ADDRESS exactly as they appear in the Deed.
`;

export const RENT_ROLL_EXTRACTION_PROMPT = `You are analyzing a Rent Roll document. Extract property and tenant information for all units.

Required JSON Structure:
{
  "propertyAddress": string | null, // The property address the rent roll is for
  "units": [
    {
      "unitNumber": string | null,
      "tenantName": string | null, // "Vacant" if empty
      "marketRent": number | null,
      "currentRent": number | null,
      "leaseStartDate": string | null, // YYYY-MM-DD
      "leaseEndDate": string | null, // YYYY-MM-DD
      "deposit": number | null,
      "balance": number | null // Outstanding balance
    }
  ],
  "totals": {
    "totalMonthlyRent": number | null,
    "totalDeposits": number | null
  },
  "confidence": {
     // Confidence score (0-1) for overall extraction
     "overall": number
  }
}

If a field is missing, use null.
`;

/**
 * Build extraction prompt based on document type
 */
export function buildExtractionPrompt(documentType: 'lease' | 'application' | 'id' | 'w9' | 'property' | 'rent_roll' | 'unknown'): string {
  switch (documentType) {
    case 'lease':
      return LEASE_EXTRACTION_PROMPT;
    case 'application':
      return APPLICATION_EXTRACTION_PROMPT;
    case 'id':
      return ID_EXTRACTION_PROMPT;
    case 'w9':
      return W9_EXTRACTION_PROMPT;
    case 'property':
      return PROPERTY_EXTRACTION_PROMPT;
    case 'rent_roll':
      return RENT_ROLL_EXTRACTION_PROMPT;
    default:
      return LEASE_EXTRACTION_PROMPT; // Default to lease
  }
}

/**
 * System prompt for document classification
 */
export const DOCUMENT_CLASSIFICATION_PROMPT = `Analyze this document and classify it as one of the following types:
- lease: Lease agreement or rental contract
- application: Rental application form
- id: Identification document (driver's license, passport, state ID)
- w9: W-9 tax form
- property: Deed, Mortgage, or Management Agreement
- rent_roll: Rent Roll, Rent Schedule, or Tenant Ledger (contains multiple units/tenants)
- unknown: Cannot determine type

Return only the type as a single word.`;
