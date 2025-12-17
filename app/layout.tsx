import type { Metadata, Viewport } from "next";
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
    default: "Smart-Lock.ro – Yale smart și încuietori inteligente pentru uși",
    template: "%s – Smart-Lock.ro – Yale smart și încuietori inteligente",
  },
  description:
    "Smart-Lock.ro este magazin online specializat în yale smart, încuietori inteligente și smart lock pentru uși de apartament și casă în România. Găsești yale digitale, gateway-uri și accesorii, cu consultanță, montaj și plată la livrare.",
  openGraph: {
    siteName: "Smart Lock",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" className="bg-black">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: 'Smart Lock',
                url: 'https://smart-lock.ro',
              },
              {
                '@context': 'https://schema.org',
                '@type': 'Store',
                name: 'Smart-Lock.ro',
                url: 'https://smart-lock.ro',
                telephone: '+40 741 119 449',
                email: 'contact@smart-lock.ro',
                address: {
                  '@type': 'PostalAddress',
                  addressCountry: 'RO',
                },
                areaServed: 'RO',
              },
            ]),
          }}
        />
        <SiteHeader />
        <CookieBanner />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
