/**
 * Compliance rules configuration
 */

export interface DocumentRequirement {
    type: string;
    name: string;
    required: boolean;
    expirationMonths?: number; // How many months until expiration
    reminderDays?: number; // Days before expiration to send reminder
}

export interface ComplianceRule {
    propertyType: string;
    documentRequirements: DocumentRequirement[];
    leaseRenewalDays: number; // Days before lease expiry to start renewal process
    inspectionFrequencyMonths?: number;
}

/**
 * Default compliance rules by property type
 */
export const DEFAULT_COMPLIANCE_RULES: Record<string, ComplianceRule> = {
    residential: {
        propertyType: 'residential',
        documentRequirements: [
            {
                type: 'lease',
                name: 'Signed Lease Agreement',
                required: true,
            },
            {
                type: 'w9',
                name: 'W-9 Tax Form',
                required: true,
            },
            {
                type: 'renters_insurance',
                name: 'Renters Insurance Certificate',
                required: true,
                expirationMonths: 12,
                reminderDays: 30,
            },
        ],
        leaseRenewalDays: 90,
    },
    commercial: {
        propertyType: 'commercial',
        documentRequirements: [
            {
                type: 'lease',
                name: 'Signed Lease Agreement',
                required: true,
            },
            {
                type: 'w9',
                name: 'W-9 Tax Form',
                required: true,
            },
            {
                type: 'liability_insurance',
                name: 'General Liability Insurance',
                required: true,
                expirationMonths: 12,
                reminderDays: 60,
            },
            {
                type: 'business_license',
                name: 'Business License',
                required: true,
                expirationMonths: 12,
                reminderDays: 30,
            },
        ],
        leaseRenewalDays: 180,
        inspectionFrequencyMonths: 6,
    },
};

/**
 * Get compliance rules for a property type
 */
export function getComplianceRules(propertyType: string): ComplianceRule {
    return DEFAULT_COMPLIANCE_RULES[propertyType] || DEFAULT_COMPLIANCE_RULES.residential;
}

/**
 * Get required document types for a property type
 */
export function getRequiredDocuments(propertyType: string): string[] {
    const rules = getComplianceRules(propertyType);
    return rules.documentRequirements
        .filter(req => req.required)
        .map(req => req.type);
}

/**
 * Get lease renewal window for a property type
 */
export function getLeaseRenewalWindow(propertyType: string): number {
    const rules = getComplianceRules(propertyType);
    return rules.leaseRenewalDays;
}

/**
 * Check if a document type requires expiration tracking
 */
export function requiresExpirationTracking(
    propertyType: string,
    documentType: string
): boolean {
    const rules = getComplianceRules(propertyType);
    const requirement = rules.documentRequirements.find(req => req.type === documentType);
    return !!requirement?.expirationMonths;
}

/**
 * Get reminder days for a document type
 */
export function getReminderDays(
    propertyType: string,
    documentType: string
): number {
    const rules = getComplianceRules(propertyType);
    const requirement = rules.documentRequirements.find(req => req.type === documentType);
    return requirement?.reminderDays || 30;
}
