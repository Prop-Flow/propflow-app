import type { Metadata } from "next";

export const dynamic = "force-dynamic";

import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const outfit = Outfit({ subsets: ["latin"], variable: '--font-outfit' });

export const metadata: Metadata = {
    title: "Propflow - Utility Intelligence for Multifamily Properties",
    description: "Detect utility anomalies early and allocate shared utility bills fairly using R.U.B.S. No hardware required.",
};

import { NotificationProvider } from '@/context/NotificationContext';
import DeveloperToolbar from '@/components/dev/DeveloperToolbar';
import AuthProvider from '@/components/providers/AuthProvider';


export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.className} ${outfit.variable}`} suppressHydrationWarning>
                <AuthProvider>
                    <NotificationProvider>
                        {children}
                        <DeveloperToolbar />
                        <div className="fixed bottom-0 right-0 p-1 text-xs text-gray-500 opacity-50 pointer-events-none z-50">
                            BUILD: {process.env.NEXT_PUBLIC_BUILD_SHA || 'DEV'}
                        </div>
                    </NotificationProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
