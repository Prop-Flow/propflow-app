'use client';
import React from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { CreditCard, CheckCircle } from 'lucide-react';

export default function TenantPaymentsPage() {
    const history = [
        { id: 1, period: 'October 2024', amount: 2400, date: 'Oct 1, 2024', status: 'Paid', method: 'Auto-Pay •••• 4242' },
        { id: 2, period: 'September 2024', amount: 2400, date: 'Sep 1, 2024', status: 'Paid', method: 'Auto-Pay •••• 4242' },
    ];

    return (
        <DashboardShell role="tenant">
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Payments</h1>
                    <p className="text-muted-foreground">Manage your payment methods and view transaction history.</p>
                </div>

                {/* Current Balance Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Current Balance</h2>
                        <div className="flex items-baseline space-x-1 mb-2">
                            <span className="text-4xl font-bold text-foreground">$0.00</span>
                            <span className="text-muted-foreground">USD</span>
                        </div>
                        <p className="text-sm text-green-500 flex items-center mb-6">
                            <CheckCircle className="w-4 h-4 mr-1.5" />
                            All caught up! Next payment due Nov 1.
                        </p>
                        <button className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                            Make a Payment
                        </button>
                    </div>

                    <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-foreground">Payment Method</h2>
                            <button className="text-sm text-primary hover:underline">Edit</button>
                        </div>
                        <div className="flex items-center space-x-4 p-4 bg-muted/30 rounded-xl border border-border mb-4">
                            <div className="bg-background p-2 rounded-lg border border-border">
                                <CreditCard className="w-6 h-6 text-foreground" />
                            </div>
                            <div>
                                <p className="font-medium text-foreground">Visa ending in 4242</p>
                                <p className="text-xs text-muted-foreground">Expires 12/28</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="h-4 w-4 rounded border border-primary bg-primary flex items-center justify-center text-primary-foreground">
                                <CheckCircle className="w-3 h-3" />
                            </div>
                            <span className="text-sm text-foreground font-medium">Auto-pay enabled</span>
                        </div>
                    </div>
                </div>

                {/* History */}
                <div>
                    <h2 className="text-xl font-bold text-foreground mb-4">Payment History</h2>
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Period</th>
                                        <th className="px-6 py-3 font-medium">Date</th>
                                        <th className="px-6 py-3 font-medium">Amount</th>
                                        <th className="px-6 py-3 font-medium">Status</th>
                                        <th className="px-6 py-3 font-medium text-right">Receipt</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {history.map((item) => (
                                        <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-foreground">{item.period}</td>
                                            <td className="px-6 py-4 text-muted-foreground">{item.date}</td>
                                            <td className="px-6 py-4 font-medium text-foreground">${item.amount.toFixed(2)}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600">
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-muted-foreground hover:text-primary transition-colors">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </DashboardShell>
    );
}

function Download(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" x2="12" y1="15" y2="3" />
        </svg>
    )
}
