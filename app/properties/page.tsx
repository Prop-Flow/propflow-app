import PropertiesClient from '@/components/properties/PropertiesClient';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function PropertiesPage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/login');
    }

    const properties = await prisma.property.findMany({
        where: {
            ownerUserId: session.user.id
        },
        include: {
            _count: {
                select: {
                    tenants: true,
                    complianceItems: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    const mappedProperties = properties.map(p => ({
        ...p,
        type: p.propertyType
    }));

    // Transform properties to match the interface expected by PropertiesClient if needed
    // The Prisma result should match Property interface in PropertiesClient mostly.

    return <PropertiesClient initialProperties={mappedProperties} />;
}
