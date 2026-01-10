'use client';


import DashboardShell from '@/components/layout/DashboardShell';
import { Hammer, AlertCircle, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function MaintenancePage() {
    const { profile, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const normalizedRole = (profile?.role || 'owner').toLowerCase();
    const role = (normalizedRole === 'property_manager' ? 'manager' : normalizedRole) as "tenant" | "owner" | "manager" | undefined || 'owner';

    // Mock maintenance requests
    const requests = [
        { id: 1, title: 'Leaky Faucet', property: 'Sunset Apartments, Unit 4B', status: 'pending', priority: 'low' },
        { id: 2, title: 'Broken AC', property: 'Downtown Lofts, Unit 12A', status: 'in_progress', priority: 'high' },
        { id: 3, title: 'Light Replacement', property: 'Sunset Apartments, Common Area', status: 'completed', priority: 'medium' },
    ];

    return (
        <DashboardShell role={role}>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Maintenance</h1>
                    <p className="text-muted-foreground mt-1">Track and manage maintenance requests</p>
                </div>
                <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all">
                    + New Request
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats */}
                <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-white/5 p-6 flex flex-col items-center justify-center text-center">
                    <div className="p-3 bg-red-500/10 rounded-full mb-3 text-red-500">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold text-foreground">1</span>
                    <span className="text-sm text-muted-foreground">Urgent</span>
                </div>
                <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-white/5 p-6 flex flex-col items-center justify-center text-center">
                    <div className="p-3 bg-blue-500/10 rounded-full mb-3 text-blue-500">
                        <Clock className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold text-foreground">1</span>
                    <span className="text-sm text-muted-foreground">In Progress</span>
                </div>
                <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-white/5 p-6 flex flex-col items-center justify-center text-center">
                    <div className="p-3 bg-green-500/10 rounded-full mb-3 text-green-500">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold text-foreground">1</span>
                    <span className="text-sm text-muted-foreground">Completed</span>
                </div>
            </div>

            <div className="mt-8 space-y-4">
                {requests.map((req) => (
                    <div key={req.id} className="bg-card/50 backdrop-blur-sm rounded-xl border border-white/5 p-4 flex items-center justify-between hover:bg-card/80 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                                <Hammer className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">{req.title}</h3>
                                <p className="text-sm text-muted-foreground">{req.property}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${req.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                                req.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'
                                }`}>
                                {req.priority.toUpperCase()}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full border ${req.status === 'completed' ? 'border-green-500/20 text-green-500' : 'border-white/10 text-muted-foreground'
                                }`}>
                                {req.status.replace('_', ' ').toUpperCase()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </DashboardShell>
    );
}
