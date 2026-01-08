import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/services/firebase-admin';
import { getSessionUser } from '@/lib/auth/session';
import { differenceInDays } from 'date-fns';

export async function GET(request: NextRequest) {
    try {
        const session = await getSessionUser(request);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const searchParams = request.nextUrl.searchParams;
        const propertyId = searchParams.get('propertyId');

        // Fetch properties owned by the user (to verify ownership)
        const propsSnapshot = await db.collection('properties')
            .where('ownerUserId', '==', session.id)
            .get();

        const ownedPropertyIds = propsSnapshot.docs.map(doc => doc.id);
        const propertiesMap = propsSnapshot.docs.reduce((acc, doc) => {
            acc[doc.id] = { id: doc.id, ...doc.data() };
            return acc;
        }, {} as Record<string, Record<string, unknown>>);

        if (ownedPropertyIds.length === 0) {
            return NextResponse.json({ generatedAt: new Date().toISOString(), summary: {}, rentRoll: [] });
        }

        // Build query for tenants
        let tenantsQuery: FirebaseFirestore.Query = db.collection('tenants').where('status', '==', 'active');

        if (propertyId) {
            if (!ownedPropertyIds.includes(propertyId)) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
            tenantsQuery = tenantsQuery.where('propertyId', '==', propertyId);
        } else {
            // Firestore 'in' limit
            tenantsQuery = tenantsQuery.where('propertyId', 'in', ownedPropertyIds.slice(0, 30));
        }

        const tenantsSnapshot = await tenantsQuery.get();

        // Fetch leases for these tenants
        const rentRoll = await Promise.all(tenantsSnapshot.docs.map(async doc => {
            const tenant = doc.data();
            const property = propertiesMap[tenant.propertyId];

            // Fetch active lease
            const leaseSnapshot = await db.collection('leases')
                .where('tenantId', '==', doc.id)
                .where('status', '==', 'ACTIVE')
                .orderBy('createdAt', 'desc')
                .limit(1)
                .get();

            const activeLease = leaseSnapshot.empty ? null : leaseSnapshot.docs[0].data();

            // Determine effective values
            const rentAmount = activeLease?.rentAmount ?? tenant.rentAmount ?? 0;
            const leaseEnd = activeLease?.endDate ?? tenant.leaseEndDate;
            const leaseStart = activeLease?.startDate ?? tenant.leaseStartDate;
            const securityDeposit = activeLease?.securityDeposit ?? 0;

            let riskStatus = 'LOW';
            let daysUntilExpiration = null;

            if (leaseEnd) {
                const today = new Date();
                const endDate = leaseEnd.toDate ? leaseEnd.toDate() : new Date(leaseEnd);
                daysUntilExpiration = differenceInDays(endDate, today);

                if (daysUntilExpiration < 0) {
                    riskStatus = 'EXPIRED';
                } else if (daysUntilExpiration <= 30) {
                    riskStatus = 'CRITICAL';
                } else if (daysUntilExpiration <= 90) {
                    riskStatus = 'HIGH';
                } else if (daysUntilExpiration <= 180) {
                    riskStatus = 'MEDIUM';
                }
            }

            return {
                id: doc.id,
                tenantName: tenant.name,
                propertyName: property?.name || 'Unknown',
                unit: tenant.apartmentNumber || 'N/A',
                type: tenant.numberOfOccupants > 0 ? 'Residential' : 'Commercial',
                sqFt: tenant.squareFootage || 0,
                rent: rentAmount,
                deposit: securityDeposit,
                leaseStart: leaseStart ? (leaseStart.toDate ? leaseStart.toDate() : new Date(leaseStart)).toISOString().split('T')[0] : 'N/A',
                leaseEnd: leaseEnd ? (leaseEnd.toDate ? leaseEnd.toDate() : new Date(leaseEnd)).toISOString().split('T')[0] : 'N/A',
                daysUntilExpiration,
                riskStatus,
                status: tenant.status
            };
        }));

        const summary = {
            totalMonthlyRent: rentRoll.reduce((sum, item) => sum + item.rent, 0),
            totalDeposits: rentRoll.reduce((sum, item) => sum + item.deposit, 0),
            totalSqFt: rentRoll.reduce((sum, item) => sum + item.sqFt, 0),
            occupancyCount: rentRoll.length,
            riskBreakdown: {
                critical: rentRoll.filter(r => r.riskStatus === 'CRITICAL').length,
                high: rentRoll.filter(r => r.riskStatus === 'HIGH').length,
                expired: rentRoll.filter(r => r.riskStatus === 'EXPIRED').length
            }
        };

        return NextResponse.json({
            generatedAt: new Date().toISOString(),
            summary,
            rentRoll
        });

    } catch (error) {
        console.error('Error generating rent roll:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
