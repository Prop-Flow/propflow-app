import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Building2, Users, MapPin } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getProperties() {
    return await prisma.property.findMany({
        include: {
            _count: {
                select: {
                    tenants: true,
                    complianceItems: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
}

export default async function PropertiesPage() {
    const properties = await getProperties();

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
                            <p className="text-slate-600 mt-1">Properties</p>
                        </div>
                        <nav className="flex gap-6">
                            <Link href="/" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                                Dashboard
                            </Link>
                            <Link href="/tenants" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                                Tenants
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
                    <h1 className="text-3xl font-bold text-slate-900">All Properties</h1>
                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all hover:scale-105">
                        + Add Property
                    </button>
                </div>

                {properties.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                        <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">No properties yet</h3>
                        <p className="text-slate-600 mb-6">Get started by adding your first property</p>
                        <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all">
                            Add Your First Property
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map((property) => (
                            <Link
                                key={property.id}
                                href={`/properties/${property.id}`}
                                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-3 rounded-lg group-hover:scale-110 transition-transform">
                                        <Building2 className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                        {property.type || 'Residential'}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                                    {property.name}
                                </h3>

                                <div className="flex items-start gap-2 text-sm text-slate-600 mb-4">
                                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>{property.address}</span>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm text-slate-600">
                                            {property._count.tenants} {property._count.tenants === 1 ? 'tenant' : 'tenants'}
                                        </span>
                                    </div>
                                    {property._count.complianceItems > 0 && (
                                        <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded">
                                            {property._count.complianceItems} pending
                                        </span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
