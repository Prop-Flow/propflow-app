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
                    const { email, password } = parsedCredentials.data;
                    console.log(`[Auth] Attempting login for: ${email}`);

                    const user = await prisma.user.findUnique({ where: { email } });
                    if (!user) {
                        console.log('[Auth] User not found');
                        return null;
                    }

                    if (!user.passwordHash) {
                        console.log('[Auth] No password hash for user');
                        return null;
                    }

                    console.log(`[Auth] User found, verifying password... (Hash: ${user.passwordHash.substring(0, 10)}...)`);
                    const passwordsMatch = await bcrypt.compare(password, user.passwordHash);

                    if (passwordsMatch) {
                        console.log('[Auth] Password verified successfully');
                        return user;
                    }



                    console.log('[Auth] Password mismatch');
                } else {
                    console.log('[Auth] Zod validation failed');
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

                // Fetch fresh user data to get role
                // In a high-scale app we might put role in the token to save a DB call
                // For now, let's trust the token or fetch if needed. 
                // Since this runs on every request in some configs, let's try to pass it through token.
            }
            // We need to type-cast or extend module types for 'role' to be valid on session.user
            // For now, we return basic session. 
            // We will fix type augmentation in a separate step if needed.
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
            }
            return token;
        }
    }
});
