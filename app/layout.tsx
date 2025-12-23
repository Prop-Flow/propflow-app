import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const outfit = Outfit({ subsets: ["latin"], variable: '--font-outfit' });

export const metadata: Metadata = {
    title: "Propflow AI - Property Management Automation",
    description: "AI-powered tenant communication and compliance tracking for property managers",
};

import { NotificationProvider } from '@/context/NotificationContext';
import DeveloperToolbar from '@/components/dev/DeveloperToolbar';
import { SessionProvider } from 'next-auth/react';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.className} ${outfit.variable}`} suppressHydrationWarning>
                <SessionProvider>
                    <NotificationProvider>
                        {children}
                        <DeveloperToolbar />
                    </NotificationProvider>
                </SessionProvider>
            </body>
        </html>
    );
}
