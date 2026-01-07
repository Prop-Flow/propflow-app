import React from 'react';

interface LeaseDocumentProps {
    data: {
        tenantName?: string;
        leaseType: string;
        startDate: string;
        endDate: string;
        rentAmount: string | number;
        securityDeposit: string | number;
        isFurnished?: boolean;
        petsAllowed?: boolean;
        leaseStructure?: string; // Commercial specific
        escalationType?: string;
        escalationValue?: string | number;
        propertyAddress?: string; // Assuming we can pass this or placeholder
    };
}

export function LeaseDocument({ data }: LeaseDocumentProps) {
    return (
        <div className="hidden print:block font-serif text-black bg-white p-[1in] max-w-[8.5in] mx-auto leading-relaxed text-base">
            {/* Header */}
            <div className="text-center mb-12 border-b-2 border-black pb-6">
                <h1 className="text-3xl font-bold uppercase tracking-widest mb-2 font-serif">RESIDENTIAL LEASE AGREEMENT</h1>
                <p className="text-sm uppercase tracking-wide text-gray-600">State of California</p>
            </div>

            <div className="space-y-8 text-justify">
                {/* Preamble */}
                <p>
                    <strong>THIS LEASE AGREEMENT</strong> (hereinafter referred to as the &quot;Agreement&quot;) is made and entered into this <strong>{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>, by and between <strong>Propflow Management</strong> (hereinafter referred to as &quot;Landlord&quot;) and <strong>{data.tenantName || '______________________'}</strong> (hereinafter referred to as &quot;Tenant&quot;).
                </p>

                {/* 1. Premises */}
                <section>
                    <h3 className="font-bold uppercase text-sm mb-3">1. THE PREMISES</h3>
                    <p>
                        Landlord agrees to lease to Tenant, and Tenant agrees to lease from Landlord, the premises located at <strong>{data.propertyAddress || '________________________________________________'}</strong> (the &quot;Premises&quot;).
                        {data.isFurnished && <span> The Premises shall be provided <strong>FURNISHED</strong> under the terms of this Agreement.</span>}
                    </p>
                </section>

                {/* 2. Term */}
                <section>
                    <h3 className="font-bold uppercase text-sm mb-3">2. TERM</h3>
                    <p>
                        The term of this Lease shall commence on <strong>{data.startDate}</strong> (the &quot;Commencement Date&quot;) and shall terminate on <strong>{data.endDate}</strong>, unless renewed or extended pursuant to the terms herein.
                    </p>
                </section>

                {/* 3. Rent */}
                <section>
                    <h3 className="font-bold uppercase text-sm mb-3">3. RENT PAYMENT</h3>
                    <p>
                        Tenant agrees to pay Landlord as base rent the sum of <strong>${Number(data.rentAmount).toLocaleString()}</strong> per month. Rent is due and payable in advance on the <strong>1st day of each month</strong>.
                        {data.leaseType === 'COMMERCIAL' && data.escalationValue && (
                            <span className="block mt-2 italic">
                                * Annual Rent Escalation: Rent shall increase annually by <strong>{data.escalationValue}{data.escalationType === 'FIXED_PERCENTAGE' ? '%' : '$'}</strong>.
                            </span>
                        )}
                    </p>
                </section>

                {/* 4. Security Deposit */}
                <section>
                    <h3 className="font-bold uppercase text-sm mb-3">4. SECURITY DEPOSIT</h3>
                    <p>
                        Upon execution of this Lease, Tenant shall deposit with Landlord the sum of <strong>${Number(data.securityDeposit).toLocaleString()}</strong> as a Security Deposit. This deposit shall be held by Landlord as security for the faithful performance of Tenant&apos;s obligations under this Lease.
                    </p>
                </section>

                {/* 5. Occupancy */}
                <section>
                    <h3 className="font-bold uppercase text-sm mb-3">5. USE AND OCCUPANCY</h3>
                    <p>
                        The Premises shall be used and occupied by Tenant {data.leaseType === 'RESIDENTIAL' ? 'solely as a private single-family residence' : 'for commercial business purposes only'}.
                        {data.leaseType === 'RESIDENTIAL' && (
                            <span> Pets are <strong>{data.petsAllowed ? 'PERMITTED' : 'PROHIBITED'}</strong> on the Premises without prior written consent from Landlord.</span>
                        )}
                    </p>
                </section>

                {/* 6. Governing Law */}
                <section>
                    <h3 className="font-bold uppercase text-sm mb-3">6. GOVERNING LAW</h3>
                    <p>
                        This Agreement shall be governed by and construed in accordance with the laws of the State where the Premises is located.
                    </p>
                </section>
            </div>

            {/* Signature Block */}
            <div className="mt-20 pt-8 border-t-2 border-black break-inside-avoid">
                <h4 className="font-bold uppercase text-sm mb-8">IN WITNESS WHEREOF, the parties have executed this Agreement on the date first above written.</h4>

                <div className="grid grid-cols-2 gap-16">
                    <div className="space-y-8">
                        <div>
                            <div className="border-b border-black h-8 mb-2"></div>
                            <p className="text-xs uppercase font-serif tracking-widest text-center">Landlord Signature</p>
                        </div>
                        <div>
                            <div className="border-b border-black h-8 mb-2"></div>
                            <p className="text-xs uppercase font-serif tracking-widest text-center">Date</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <div className="border-b border-black h-8 mb-2"></div>
                            <p className="text-xs uppercase font-serif tracking-widest text-center">Tenant Signature</p>
                        </div>
                        <div>
                            <div className="border-b border-black h-8 mb-2"></div>
                            <p className="text-xs uppercase font-serif tracking-widest text-center">Date</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
