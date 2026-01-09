import Link from 'next/link';
import { Activity } from 'lucide-react';

export default function RecentActivity() {
    return (
        <div className="flex-1 rounded-xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-sm shadow-lg hover:border-white/20 transition-all">
            <h3 className="mb-4 text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-400" />
                Recent Activity
            </h3>
            <div className="space-y-4">
                {[
                    { action: 'Rent Received', unit: 'Unit 4B', time: '2h ago', type: 'success' },
                    { action: 'Maintenance req', unit: 'Unit 2A', time: '5h ago', type: 'warning' },
                    { action: 'Lease Signed', unit: 'Unit 1C', time: '1d ago', type: 'info' }
                ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors group cursor-default">
                        <div className={`mt-1.5 h-2 w-2 rounded-full ring-2 ring-opacity-20 ${item.type === 'success' ? 'bg-emerald-400 ring-emerald-400' : item.type === 'warning' ? 'bg-amber-400 ring-amber-400' : 'bg-blue-400 ring-blue-400'}`} />
                        <div>
                            <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{item.action}</p>
                            <p className="text-xs text-slate-500">{item.unit} • {item.time}</p>
                        </div>
                    </div>
                ))}
            </div>
            <Link href="/notifications" className="mt-6 block w-full rounded-lg bg-white/5 py-2 text-center text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                View All Activity
            </Link>
        </div>
    );
}
