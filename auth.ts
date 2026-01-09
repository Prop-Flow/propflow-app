import NextAuth from 'next-auth';
// import { db } from '@/lib/services/firebase-admin'; // Removed top-level import to prevent crash
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
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                console.log('[Auth] Authorizing credentials:', {
                    email: (credentials as any)?.email,
                    hasPassword: !!(credentials as any)?.password
                });

                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email: rawEmail, password } = parsedCredentials.data;
                    const email = rawEmail.toLowerCase().trim();

                    // Special case for Developer Mode - Checked BEFORE DB import
                    if (email === 'dev@propflow.ai' && password === 'Sharktank101!') {
                        console.log('[Auth] Developer Mode bypass triggered successfully');
                        logger.auth('Developer Mode bypass triggered');
                        return {
                            id: 'dev-mode-user',
                            email: 'dev@propflow.ai',
                            name: 'Developer Mode',
                            role: 'owner',
                        };
                    }

                    try {
                        // Dynamically import DB only when needed
                        // This prevents the entire auth route from crashing if Firebase env vars are missing
                        const { db } = await import('@/lib/services/firebase-admin');

                        const userSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();

                        if (userSnapshot.empty) {
                            console.log(`[Auth] User not found: ${email}`);
                            logger.auth('User not found');
                            return null;
                        }

                        const userDoc = userSnapshot.docs[0];
                        const user = userDoc.data();

                        if (!user.passwordHash) {
                            console.log(`[Auth] No password hash for user: ${email}`);
                            logger.auth(`No password hash for user: ${email}`);
                            return null;
                        }

                        console.log(`[Auth] Verifying password for ${email}`);
                        const passwordsMatch = await bcrypt.compare(password, user.passwordHash);

                        if (passwordsMatch) {
                            console.log(`[Auth] authentication successful for ${email}`);
                            logger.auth(`Password verified successfully for ${email}`);
                            const returnUser = {
                                id: userDoc.id,
                                email: user.email,
                                name: user.name,
                                role: user.role as any,
                            };
                            return returnUser;
                        }

                        console.log(`[Auth] Password mismatch for ${email}`);
                        logger.auth(`Password mismatch for ${email}`);
                    } catch (error) {
                        console.error('[Auth] Database error:', error);
                        logger.error('Database connection failed during auth', error);
                        return null;
                    }
                } else {
                    console.error('[Auth] Zod validation failed:', parsedCredentials.error);
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
