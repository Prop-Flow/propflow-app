import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAgentResponse } from '@/lib/ai/agent-engine';
import { routeMessage } from '@/lib/communication/channel-router';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { workflowType, tenantId, propertyId, scenario, documentType } = body;

        if (!workflowType) {
            return NextResponse.json(
                { error: 'workflowType is required' },
                { status: 400 }
            );
        }

        let result: any = {};

        switch (workflowType) {
            case 'tenant_followup':
            case 'document_collection': {
                if (!tenantId) {
                    return NextResponse.json(
                        { error: 'tenantId is required' },
                        { status: 400 }
                    );
                }

                // Get tenant details
                const tenant = await prisma.tenant.findUnique({
                    where: { id: tenantId },
                    include: { property: true },
                });

                if (!tenant) {
                    return NextResponse.json(
                        { error: 'Tenant not found' },
                        { status: 404 }
                    );
                }

                // Determine scenario details
                let agentScenario: 'lease_renewal' | 'document_collection' | 'maintenance_followup' = 'document_collection';
                let specificDetails = '';

                if (workflowType === 'document_collection') {
                    agentScenario = 'document_collection';
                    specificDetails = `Please submit your ${documentType || 'required document'}.`;
                } else if (scenario === 'lease_renewal') {
                    agentScenario = 'lease_renewal';
                    specificDetails = `Your lease expires on ${tenant.leaseEndDate?.toLocaleDateString()}. We need to discuss renewal.`;
                }

                // Generate AI response
                const message = await generateAgentResponse({
                    tenantId: tenant.id,
                    tenantName: tenant.name,
                    propertyAddress: tenant.property.address,
                    scenario: agentScenario,
                    specificDetails,
                    attemptNumber: 1,
                });

                // Send via appropriate channel
                const sendResult = await routeMessage({
                    tenantId: tenant.id,
                    tenantName: tenant.name,
                    phone: tenant.phone || undefined,
                    email: tenant.email || undefined,
                    message,
                    subject: workflowType === 'document_collection'
                        ? `Document Request - ${documentType}`
                        : 'Lease Renewal',
                    attemptNumber: 1,
                });

                // Create workflow execution record
                const execution = await prisma.workflowExecution.create({
                    data: {
                        workflowType,
                        tenantId,
                        status: sendResult.success ? 'completed' : 'failed',
                        attemptCount: 1,
                        lastAttemptAt: new Date(),
                        metadata: {
                            scenario: agentScenario,
                            channel: sendResult.channel,
                            messageId: sendResult.messageId,
                        },
                        result: sendResult.success ? 'Message sent successfully' : sendResult.error,
                    },
                });

                result = {
                    success: sendResult.success,
                    executionId: execution.id,
                    channel: sendResult.channel,
                    message,
                };
                break;
            }

            case 'compliance_check': {
                // This would trigger a comprehensive compliance scan
                // For now, just create a workflow execution record
                const execution = await prisma.workflowExecution.create({
                    data: {
                        workflowType: 'compliance_check',
                        propertyId,
                        status: 'running',
                        attemptCount: 1,
                        lastAttemptAt: new Date(),
                        metadata: {
                            timestamp: new Date().toISOString(),
                        },
                    },
                });

                result = {
                    success: true,
                    executionId: execution.id,
                    message: 'Compliance check initiated',
                };
                break;
            }

            default:
                return NextResponse.json(
                    { error: 'Invalid workflow type' },
                    { status: 400 }
                );
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Error triggering workflow:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to trigger workflow' },
            { status: 500 }
        );
    }
}
