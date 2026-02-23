import type { Metadata, Viewport } from "next";
import { Inter, Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/components/session-provider";
import { PWARegister } from "@/components/pwa/register";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { Toaster } from "sonner";
import NextTopLoader from 'nextjs-toploader';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const jakarta = Plus_Jakarta_Sans({
    subsets: ["latin"],
    variable: "--font-jakarta",
    display: 'swap',
});

const APP_NAME = "Jacobt";
const APP_DEFAULT_TITLE = "Jacobt";
const APP_TITLE_TEMPLATE = "%s - Jacobt";
const APP_DESCRIPTION = "Manage community assets, track targets, and submit payments efficiently.";

export const viewport: Viewport = {
    themeColor: "#151B29",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    viewportFit: 'cover',
};

export const metadata: Metadata = {
    title: APP_DEFAULT_TITLE,
    description: APP_DESCRIPTION,
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: APP_NAME,
    },
    formatDetection: {
        telephone: false,
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="apple-touch-icon" href="/icon-192x192.png" />
            </head>
            <body
                className={`${jakarta.variable} ${outfit.variable} ${inter.variable} font-sans antialiased min-h-screen bg-background flex flex-col`}
                suppressHydrationWarning
            >
                <NextTopLoader color="#F28C28" showSpinner={false} />
                <PWARegister />
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <SessionProvider>
                        {children}
                        <InstallPrompt />
                        <Toaster position="top-center" richColors />
                    </SessionProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
