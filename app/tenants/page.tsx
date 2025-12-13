import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { User, Mail, Phone, Building2, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { getMissingDocuments } from '@/lib/documents/tracker';

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
        tenants.map(async (tenant) => {
            const missingDocs = await getMissingDocuments(tenant.id);
            return {
                ...tenant,
                missingDocsCount: missingDocs.length,
            };
        })
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Propflow AI
                            </Link>
                            <p className="text-slate-600 mt-1">Tenants</p>
                        </div>
                        <nav className="flex gap-6">
                            <Link href="/" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                                Dashboard
                            </Link>
                            <Link href="/properties" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                                Properties
                            </Link>
                            <Link href="/compliance" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                                Compliance
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">All Tenants</h1>
                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all hover:scale-105">
                        + Add Tenant
                    </button>
                </div>

                {tenantsWithStatus.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                        <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">No tenants yet</h3>
                        <p className="text-slate-600 mb-6">Add your first tenant to get started</p>
                        <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all">
                            Add Your First Tenant
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tenantsWithStatus.map((tenant) => (
                            <Link
                                key={tenant.id}
                                href={`/tenants/${tenant.id}`}
                                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all block group"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-3 rounded-lg group-hover:scale-110 transition-transform">
                                                <User className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                    {tenant.name}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Building2 className="w-4 h-4" />
                                                    <span>{tenant.property.name}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-16">
                                            {tenant.email && (
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Mail className="w-4 h-4 text-slate-400" />
                                                    <span>{tenant.email}</span>
                                                </div>
                                            )}
                                            {tenant.phone && (
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Phone className="w-4 h-4 text-slate-400" />
                                                    <span>{tenant.phone}</span>
                                                </div>
                                            )}
                                            {tenant.leaseEndDate && (
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Calendar className="w-4 h-4 text-slate-400" />
                                                    <span>Lease ends {tenant.leaseEndDate.toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${tenant.status === 'active'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-slate-100 text-slate-700'
                                            }`}>
                                            {tenant.status.toUpperCase()}
                                        </span>
                                        {tenant.missingDocsCount > 0 ? (
                                            <div className="flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                                                <AlertCircle className="w-3 h-3" />
                                                <span>{tenant.missingDocsCount} docs missing</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
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
            </main>
        </div>
    );
}
