
export interface ExtractedPropertyData {
    property?: {
        address?: string;
        type?: string;
        upgrades?: string;
        beds?: number | string;
        baths?: number | string;
        garageSpaces?: number | string;
        city?: string;
        state?: string;
        zipCode?: string;
        buildingName?: string;
        units?: number;
    };
    owner?: {
        legalName1?: string;
        legalName2?: string;
        email?: string;
        phone?: string;
        mailingAddress?: string;
    };
    financials?: {
        listPrice?: number;
        hoaFee?: number;
        taxAmount?: number;
    };
    propertyAddress?: string; // Fallback
}

export interface ExtractedTenantData {
    unitNumber?: string;
    name?: string;
    rentAmount?: number;
    securityDeposit?: number;
    leaseStartDate?: string | Date;
    leaseEndDate?: string | Date;
    email?: string;
    phone?: string;
}

export interface RentRollUnit {
    unitNumber?: string;
    tenantName?: string;
    currentRent?: number;
    marketRent?: number;
    leaseEndDate?: string | Date;
    leaseStartDate?: string | Date;
    status: 'Occupied' | 'Vacant';
    email?: string;
    phone?: string;
    deposit?: number;
    bedrooms?: number;
    bathrooms?: number;
}

export interface RentRollData {
    units: RentRollUnit[];
    totals: Record<string, number>;
    confidence: Record<string, number>;
    propertyAddress?: string;
}

export interface ParseResult {
    documentType: 'lease' | 'rent_roll' | 'unknown';
    extractedData: ExtractedPropertyData | ExtractedTenantData | RentRollData | unknown;
    overallConfidence: number;
}

export const parseDocument = async (buffer: Buffer, fileType: string): Promise<ParseResult> => {
    console.log(`[Mock] Parsing document of type ${fileType}`);
    throw new Error("Document parsing not configured in this environment");
};
