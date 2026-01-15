import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";



export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    debug: true,

    // CRITICAL: Trust proxy headers from Firebase Hosting
    // This allows NextAuth to work correctly when behind Firebase Hosting proxy
    trustHost: true,

    // Use JWT for sessions (no database required)
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    // Explicit cookie configuration for proxied environment
    // This is critical for Firebase Hosting -> Cloud Run architecture
    cookies: {
        sessionToken: {
            name: `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: true,
            },
        },
        callbackUrl: {
            name: `next-auth.callback-url`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: true,
            },
        },
        csrfToken: {
            name: `next-auth.csrf-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: true,
            },
        },
        pkceCodeVerifier: {
            name: `next-auth.pkce.code_verifier`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: true,
                maxAge: 900, // 15 minutes
            },
        },
        state: {
            name: `next-auth.state`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: true,
                maxAge: 900, // 15 minutes
            },
        },
        nonce: {
            name: `next-auth.nonce`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: true,
            },
        },
    },


    // Callbacks for session and JWT handling
    callbacks: {
        async jwt({ token, account, profile }) {
            // Persist the OAuth access_token and user info to the token right after signin
            if (account) {
                token.accessToken = account.access_token;
                token.id = profile?.sub;
            }
            return token;
        },
        async session({ session, token }) {
            // Send properties to the client
            if (session.user && token.id) {
                (session.user as any).id = token.id;
            }
            return session;
        },
    },
};

export default NextAuth(authOptions);

