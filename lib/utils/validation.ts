import { z } from 'zod';

// Property validation schemas
export const propertySchema = z.object({
    name: z.string().min(1, 'Property name is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    type: z.string().optional(),
    units: z.number().int().positive().default(1),
    ownerName: z.string().optional(),
    ownerEmail: z.string().email().optional().or(z.literal('')),
    ownerPhone: z.string().optional(),
});

export type PropertyInput = z.infer<typeof propertySchema>;

// Tenant validation schemas
export const tenantSchema = z.object({
    propertyId: z.string().min(1, 'Property is required'),
    name: z.string().min(1, 'Tenant name is required'),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    leaseStartDate: z.string().or(z.date()).optional(),
    leaseEndDate: z.string().or(z.date()).optional(),
    rentAmount: z.number().positive().optional(),
    status: z.enum(['active', 'inactive', 'pending']).default('active'),
});

export type TenantInput = z.infer<typeof tenantSchema>;

// Document validation schemas
export const documentSchema = z.object({
    tenantId: z.string().min(1, 'Tenant is required'),
    type: z.string().min(1, 'Document type is required'),
    name: z.string().min(1, 'Document name is required'),
    status: z.enum(['pending', 'submitted', 'approved', 'expired']).default('pending'),
    expirationDate: z.string().or(z.date()).optional(),
});

export type DocumentInput = z.infer<typeof documentSchema>;

// Compliance item validation schemas
export const complianceItemSchema = z.object({
    propertyId: z.string().optional(),
    tenantId: z.string().optional(),
    type: z.string().min(1, 'Compliance type is required'),
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    dueDate: z.string().or(z.date()),
    status: z.enum(['pending', 'completed', 'overdue']).default('pending'),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

export type ComplianceItemInput = z.infer<typeof complianceItemSchema>;

// Communication log validation schemas
export const communicationLogSchema = z.object({
    tenantId: z.string().min(1, 'Tenant is required'),
    channel: z.enum(['sms', 'email', 'voice']),
    direction: z.enum(['outbound', 'inbound']),
    message: z.string().min(1, 'Message is required'),
    status: z.enum(['sent', 'delivered', 'failed', 'received']),
    metadata: z.record(z.any()).optional(),
});

export type CommunicationLogInput = z.infer<typeof communicationLogSchema>;

// Workflow execution validation schemas
export const workflowExecutionSchema = z.object({
    workflowType: z.enum(['tenant_followup', 'document_collection', 'compliance_check']),
    tenantId: z.string().optional(),
    propertyId: z.string().optional(),
    status: z.enum(['running', 'completed', 'failed']),
    attemptCount: z.number().int().nonnegative().default(0),
    metadata: z.record(z.any()).optional(),
    result: z.string().optional(),
});

export type WorkflowExecutionInput = z.infer<typeof workflowExecutionSchema>;
