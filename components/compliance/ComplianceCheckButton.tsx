'use client';

import React from 'react';
import { Plus } from 'lucide-react';

export default function ComplianceCheckButton() {
    return (
        <button
            onClick={() => alert("Compliance checks are automatically scheduled based on property regulations.\n\nTo manually trigger a check, please go to the specific Property -> Compliance tab.")}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2"
        >
            <Plus className="w-4 h-4" />
            <span>New Check</span>
        </button>
    );
}
