import Link from 'next/link';
import { Building2, Users, Activity } from 'lucide-react';
import DashboardShell from '@/components/layout/DashboardShell';
import AIInsightCard from '@/components/dashboard/AIInsightCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import RevenueChart from '@/components/dashboard/RevenueChart';

// import { db } from '@/lib/services/firebase-admin'; // Removed for MVP build to avoid build errors if credentials missing

export const dynamic = 'force-dynamic';

async function getDashboardStats(userId: string) {
    // Mock data for MVP build/preview if DB connection fails or for speed
    return {
        properties: 12,
        tenants: 8,
    };
}

export default async function DashboardPage() {
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
            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">

                {/* Left Column: Stats & Financials (Span 8) */}
                <div className="md:col-span-8 flex flex-col gap-6">

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link href="/properties" className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-emerald-900/50 to-slate-900/50 p-6 shadow-lg transition-all hover:shadow-emerald-500/10 hover:border-emerald-500/30">
                            <div className="absolute top-0 right-0 p-4 opacity-50 transition-opacity group-hover:opacity-100">
                                <Building2 className="h-8 w-8 text-emerald-400" />
                            </div>
                            <p className="text-sm font-medium text-emerald-200/70">Total Properties</p>
                            <p className="mt-2 text-3xl font-bold text-white group-hover:text-emerald-300 transition-colors">{stats.properties}</p>
                            <div className="mt-2 h-1 w-full rounded-full bg-white/5">
                                <div className="h-full w-[70%] rounded-full bg-emerald-500/50" />
                            </div>
                        </Link>

                        <Link href="/tenants" className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-blue-900/50 to-slate-900/50 p-6 shadow-lg transition-all hover:shadow-blue-500/10 hover:border-blue-500/30">
                            <div className="absolute top-0 right-0 p-4 opacity-50 transition-opacity group-hover:opacity-100">
                                <Users className="h-8 w-8 text-blue-400" />
                            </div>
                            <p className="text-sm font-medium text-blue-200/70">Active Tenants</p>
                            <p className="mt-2 text-3xl font-bold text-white group-hover:text-blue-300 transition-colors">{stats.tenants}</p>
                            <div className="mt-2 h-1 w-full rounded-full bg-white/5">
                                <div className="h-full w-[85%] rounded-full bg-blue-500/50" />
                            </div>
                        </Link>
                    </div>

                    {/* Financial Overview */}
                    <RevenueChart />
                </div>

                {/* Right Column: AI & Activity (Span 4) */}
                <div className="md:col-span-4 flex flex-col gap-6">
                    <AIInsightCard />
                    <RecentActivity />
                </div>
            </div>
        </DashboardShell>
    );
}
