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
                        <div className="fixed bottom-2 right-2 px-2 py-1 text-xs font-mono bg-black/50 text-gray-300 rounded border border-gray-700/50 backdrop-blur-sm z-50">
                            BUILD: {process.env.NEXT_PUBLIC_BUILD_SHA || 'DEV'}
                        </div>
                    </NotificationProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
