import DashboardShell from '@/components/layout/DashboardShell';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
    return (
        <DashboardShell>
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="p-4 rounded-full bg-slate-800/50 border border-white/10">
                    <Bell className="h-8 w-8 text-slate-400" />
                </div>
                <h1 className="text-xl font-semibold text-slate-200">Notifications</h1>
                <p className="text-slate-500">You're all caught up! Check back later for updates.</p>
            </div>
        </DashboardShell>
    );
}
