import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Hind_Siliguri } from "next/font/google";

const hindSiliguri = Hind_Siliguri({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali"],
  variable: "--font-bengali",
  display: "swap",
});

import { Providers } from "@/components/providers";
import { getSiteSettings } from "@/lib/actions/settings-actions";

export async function generateMetadata(): Promise<Metadata> {
  let settings;
  try {
    settings = await getSiteSettings();
  } catch (error) {
    console.error("Failed to fetch site settings for metadata:", error);
    // Continue with undefined settings (which falls back to defaults)
  }
  return {
    title: {
      default: settings?.madrasaName || "মাদ্রাসা ম্যানেজমেন্ট সিস্টেম",
      template: `%s | ${settings?.madrasaName || "Madrasa System"}`,
    },
    description: "আধুনিক মাদ্রাসা ম্যানেজমেন্ট সিস্টেম",
    icons: {
      icon: settings?.madrasaLogo || "/favicon.ico",
    }
  };
}

import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${hindSiliguri.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
