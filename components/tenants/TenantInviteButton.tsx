'use client';

import React from 'react';
import { Plus } from 'lucide-react';

export default function TenantInviteButton() {
    return (
        <button
            onClick={() => alert("To invite a tenant:\n\n1. Provide them with your Property's Building Code (found on Property Details page).\n2. Direct them to the registration page: /onboarding/tenant")}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2"
        >
            <Plus className="w-4 h-4" />
            <span>Add Tenant</span>
        </button>
    );
}
