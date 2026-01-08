import NextAuth from 'next-auth';
import { db } from '@/lib/services/firebase-admin';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { logger } from '@/lib/logger';

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        updateAge: 24 * 60 * 60,   // 24 hours - refresh token daily
    },
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email: rawEmail, password } = parsedCredentials.data;
                    const email = rawEmail.toLowerCase().trim();
                    logger.auth(`Attempting login for: ${email}`);

                    const userSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();

                    if (userSnapshot.empty) {
                        logger.auth('User not found');
                        return null;
                    }

                    const userDoc = userSnapshot.docs[0];
                    const user = userDoc.data();

                    if (!user.passwordHash) {
                        logger.auth(`No password hash for user: ${email}`);
                        return null;
                    }

                    logger.auth(`User found, verifying password for ${email}`);
                    const passwordsMatch = await bcrypt.compare(password, user.passwordHash);

                    if (passwordsMatch) {
                        logger.auth(`Password verified successfully for ${email}`);
                        const returnUser = {
                            id: userDoc.id,
                            email: user.email,
                            name: user.name,
                            role: user.role as any,
                        };
                        logger.debug('Returning user object', returnUser);
                        return returnUser;
                    }

                    logger.auth(`Password mismatch for ${email}`);
                } else {
                    logger.auth('Credential validation failed');
                }

                logger.auth('Authentication failed');
                return null;
            },
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub;
                session.user.role = token.role as any;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
                token.role = (user as any).role;
            }
            return token;
        }
    }
});
