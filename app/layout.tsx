import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CookieBanner } from "@/components/cookie-banner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Smart Lock - Yale smart de înaltă securitate",
    template: "%s – Smart Lock - Yale smart de înaltă securitate",
  },
  description:
    "Soluții Smart Lock cu yale inteligente de înaltă securitate, gateway-uri și accesorii pentru control modern al accesului.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        <SiteHeader />
        <CookieBanner />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
