import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma),
    session: { strategy: 'jwt' },
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email: rawEmail, password } = parsedCredentials.data;
                    const email = rawEmail.toLowerCase().trim();
                    console.log(`[Auth] Attempting login for: ${email} (Raw: ${rawEmail})`);

                    // DEV MODE BYPASS (ANONYMOUS)
                    if (email === 'dev@propflow.ai' && password === 'sharktank101!') {
                        console.log('[Auth] Dev Mode bypass triggered (Anonymous)');
                        return {
                            id: 'dev-mode-user',
                            email: 'dev@propflow.ai',
                            name: 'Developer Mode',
                            role: 'OWNER',
                        } as any;
                    }

                    const user = await prisma.user.findUnique({ where: { email } });
                    if (!user) {
                        console.log('[Auth] User not found');
                        return null;
                    }

                    if (!user.passwordHash) {
                        console.log(`[Auth] No password hash for user: ${email}`);
                        return null;
                    }

                    console.log(`[Auth] User found, verifying password for ${email}... (Hash: ${user.passwordHash.substring(0, 10)}...)`);
                    const passwordsMatch = await bcrypt.compare(password, user.passwordHash);

                    if (passwordsMatch) {
                        console.log(`[Auth] Password verified successfully for ${email}`);
                        const returnUser = {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            role: user.role,
                        };
                        console.log(`[Auth] Returning user object:`, JSON.stringify(returnUser));
                        return returnUser;
                    }

                    console.log(`[Auth] Password mismatch for ${email}. Checked against hash starting with: ${user.passwordHash.substring(0, 10)}`);
                } else {
                    console.log('[Auth] Zod validation failed for credentials:', JSON.stringify(parsedCredentials.error.format()));
                }

                console.log('[Auth] returning null');
                return null;
            },
        }),
    ],
    // Extend session to include role and other fields
    callbacks: {
        ...authConfig.callbacks,
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                session.user.role = token.role as any;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                token.role = (user as any).role;
            }
            return token;
        }
    }
});
