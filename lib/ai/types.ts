export interface ExtractedTenantData {
    name?: string;
    unitNumber?: string;
    email?: string;
    phone?: string;
    propertyAddress?: string;
    leaseStartDate?: string;
    leaseEndDate?: string;
    rentAmount?: number;
    securityDeposit?: number;
    emergencyContact?: string;
    currentAddress?: string;
    monthlyIncome?: number;
    employer?: string;
    dateOfBirth?: string;
    confidence: {
        [key: string]: number;
    };
}

export interface ExtractedPropertyData {
    owner: {
        legalName1?: string;
        legalName2?: string;
        email?: string;
        phone?: string;
        mailingAddress?: string;
    };
    property: {
        address?: string;
        type?: 'condo' | 'single_family' | 'multi_unit' | 'commercial';
        beds?: number;
        baths?: number;
        garageSpaces?: number;
        upgrades?: string;
    };
    financials: {
        listPrice?: number;
        hoaFee?: number;
        taxAmount?: number;
    };
    legalDescription?: string;
    documentType?: 'deed' | 'lease' | 'management_agreement' | 'other';
    confidence: {
        [key: string]: number;
    };
}

export interface RentRollData {
    propertyAddress?: string;
    units: {
        unitNumber: string;
        tenantName: string;
        marketRent?: number;
        currentRent?: number;
        leaseStartDate?: string;
        leaseEndDate?: string;
        deposit?: number;
        balance?: number;
        email?: string;
        phone?: string;
        status?: 'Occupied' | 'Vacant';
    }[];
    totals: {
        totalMonthlyRent?: number;
        totalDeposits?: number;
    };
    confidence: {
        [key: string]: number;
    };
}

export interface ParsedDocument {
    documentType: 'lease' | 'application' | 'id' | 'w9' | 'property' | 'rent_roll' | 'unknown';
    extractedData: ExtractedTenantData | ExtractedPropertyData | RentRollData;
    overallConfidence: number;
    rawText?: string;
}
