/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { User, Mail, Phone, Building2, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { getMissingDocuments } from '@/lib/documents/tracker';
import DashboardShell from '@/components/layout/DashboardShell';

export const dynamic = 'force-dynamic';

async function getTenants() {
    return await prisma.tenant.findMany({
        include: {
            property: true,
            _count: {
                select: {
                    documents: true,
                    communicationLogs: true,
                    complianceItems: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
}

export default async function TenantsPage() {
    const tenants = await getTenants();

    // Get missing documents for each tenant
    const tenantsWithStatus = await Promise.all(
        tenants.map(async (tenant: any) => {
            const missingDocs = await getMissingDocuments(tenant.id);
            return {
                ...tenant,
                missingDocsCount: missingDocs.length,
            };
        })
    );

    return (
        <DashboardShell role="owner">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-foreground">All Tenants</h1>
                <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2">
                    <span>+ Add Tenant</span>
                </button>
            </div>

            {tenantsWithStatus.length === 0 ? (
                <div className="bg-card/30 backdrop-blur-sm rounded-xl border border-dashed border-white/10 p-12 text-center">
                    <User className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">No tenants yet</h3>
                    <p className="text-muted-foreground mb-6">Add your first tenant to get started</p>
                    <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all">
                        Add Your First Tenant
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {tenantsWithStatus.map((tenant: any) => (
                        <Link
                            key={tenant.id}
                            href={`/tenants/${tenant.id}`}
                            className="bg-card/50 backdrop-blur-sm rounded-xl border border-white/5 p-6 hover:border-primary/50 hover:shadow-md hover:shadow-primary/10 transition-all block group"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="bg-primary/10 p-3 rounded-lg group-hover:scale-110 transition-transform">
                                            <User className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                                                {tenant.name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Building2 className="w-4 h-4" />
                                                <span>{tenant.property.name}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-16">
                                        {tenant.email && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Mail className="w-4 h-4 text-muted-foreground/70" />
                                                <span>{tenant.email}</span>
                                            </div>
                                        )}
                                        {tenant.phone && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Phone className="w-4 h-4 text-muted-foreground/70" />
                                                <span>{tenant.phone}</span>
                                            </div>
                                        )}
                                        {tenant.leaseEndDate && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="w-4 h-4 text-muted-foreground/70" />
                                                <span>Lease ends {tenant.leaseEndDate.toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${tenant.status === 'active'
                                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                        : 'bg-white/5 text-muted-foreground border border-white/10'
                                        }`}>
                                        {tenant.status.toUpperCase()}
                                    </span>
                                    {tenant.missingDocsCount > 0 ? (
                                        <div className="flex items-center gap-1 text-xs font-medium text-orange-400 bg-orange-400/10 px-3 py-1 rounded-full border border-orange-400/20">
                                            <AlertCircle className="w-3 h-3" />
                                            <span>{tenant.missingDocsCount} docs missing</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
                                            <CheckCircle className="w-3 h-3" />
                                            <span>Compliant</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </DashboardShell>
    );
}
