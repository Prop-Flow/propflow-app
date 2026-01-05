import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Building2, Users } from 'lucide-react';
import DashboardShell from '@/components/layout/DashboardShell';
import { getSessionUser } from '@/lib/auth/session';
import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

async function getDashboardStats(userId: string) {
    try {
        const [propertyCount, tenantCount] = await Promise.all([
            prisma.property.count({
                where: { ownerUserId: userId }
            }),
            prisma.tenant.count({
                where: {
                    status: 'active',
                    property: { ownerUserId: userId }
                }
            })
        ]);

        return {
            properties: propertyCount,
            tenants: tenantCount,
        };
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return {
            properties: 0,
            tenants: 0,
        };
    }
}

export default async function DashboardPage() {
    // We need to pass a mock NextRequest or use the session directly if accessible
    // In server components, better to use the underlying auth() check
    // Since getSessionUser expects NextRequest, we'll try to get it from headers/cookies if possible
    // or just use auth() directly from @/auth

    const { auth } = await import('@/auth');
    const session = await auth();

    if (!session?.user?.id) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p>Please sign in to view your dashboard.</p>
                <Link href="/login" className="text-blue-600 hover:underline mt-4">Sign In</Link>
            </div>
        );
    }

    const userId = session.user.id;
    const stats = await getDashboardStats(userId);

    return (
        <DashboardShell role="owner">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Link href="/properties" className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Total Properties</p>
                            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.properties}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </Link>

                <Link href="/tenants" className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Active Tenants</p>
                            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.tenants}</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-lg">
                            <Users className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </Link>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
                <h2 className="text-2xl font-bold text-blue-900 mb-4">Welcome to your simplified dashboard</h2>
                <p className="text-blue-700 max-w-2xl mx-auto">
                    We&apos;ve cleaned up the extra features and are rebuilding the financial optimization engine step by step.
                    You can currently manage your properties and tenants.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                    <Link href="/properties" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-500 transition-colors">
                        Manage Properties
                    </Link>
                    <Link href="/tenants" className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors">
                        View Tenants
                    </Link>
                </div>
            </div>
        </DashboardShell>
    );
}
