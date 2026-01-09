import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    trustHost: true,
    pages: {
        signIn: '/login',
    },
    useSecureCookies: process.env.NODE_ENV === 'production',
    // cookies: {
    //     sessionToken: {
    //         name: process.env.NODE_ENV === 'production'
    //             ? '__Secure-next-auth.session-token'
    //             : 'next-auth.session-token',
    //         options: {
    //             httpOnly: true,
    //             sameSite: 'lax',
    //             path: '/',
    //             secure: process.env.NODE_ENV === 'production'
    //         }
    //     }
    // },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                // formatting fix: moved logic here to avoid deep nesting if needed later
                return true;
            }
            return true;
        },
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
                // Ensure email is passed from token to session
                if (token.email) {
                    session.user.email = token.email as string;
                }
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
                // Store email in JWT token for session lookup
                token.email = user.email;
            }
            return token;
        }
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
