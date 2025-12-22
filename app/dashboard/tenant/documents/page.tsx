'use client';
import React from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { FileText, Download, Eye } from 'lucide-react';

export default function TenantDocumentsPage() {
    // Mock data for now
    const documents = [
        { id: 1, name: 'Lease Agreement 2024-2025', date: 'Oct 15, 2024', type: 'Lease', size: '2.4 MB' },
        { id: 2, name: 'Move-in Inspection Report', date: 'Oct 15, 2024', type: 'Inspection', size: '1.8 MB' },
        { id: 3, name: 'Welcome Packet', date: 'Oct 15, 2024', type: 'Guide', size: '4.5 MB' },
    ];

    return (
        <DashboardShell role="tenant">
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">My Documents</h1>
                        <p className="text-muted-foreground">Access your lease, addendums, and other important files.</p>
                    </div>
                    <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                        Upload Document
                    </button>
                </div>

                <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <div className="divide-y divide-border">
                        {documents.map((doc) => (
                            <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">{doc.name}</p>
                                        <div className="flex items-center text-xs text-muted-foreground mt-0.5 space-x-2">
                                            <span>{doc.type}</span>
                                            <span>•</span>
                                            <span>{doc.date}</span>
                                            <span>•</span>
                                            <span>{doc.size}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">
                                        <Download className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
