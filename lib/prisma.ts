import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Use DATABASE_URL or NETLIFY_DATABASE_URL (for Netlify/Neon integration)
const connectionString = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;

export const prisma = globalForPrisma.prisma || new PrismaClient({
    datasources: {
        db: {
            url: connectionString,
        },
    },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
