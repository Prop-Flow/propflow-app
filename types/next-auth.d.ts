
import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            /** The user's role. */
            role: 'tenant' | 'owner' | 'property_manager'
        } & DefaultSession["user"]
    }

    interface User {
        role: 'tenant' | 'owner' | 'property_manager'
    }
}
