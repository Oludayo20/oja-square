import type { Metadata, Viewport } from "next";
import { Sora } from "next/font/google";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import StickySellBanner from "@/components/StickySellBanner";
import { SiteJsonLd } from "@/components/SiteJsonLd";
import { CORE_KEYWORDS, SITE_DESCRIPTION, SITE_NAME, getSiteUrl } from "@/lib/seo";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-sora",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d9488",
};

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  applicationName: SITE_NAME,
  title: {
    default: "Oja Square — Shop Every Store on Oja | Nigeria's Cross-Store Marketplace",
    template: "%s | Oja Square",
  },
  description: SITE_DESCRIPTION,
  keywords: CORE_KEYWORDS,
  authors: [{ name: "Oja" }],
  creator: "Oja",
  publisher: "Oja",
  category: "shopping",
  alternates: {
    canonical: "/",
    languages: { "en-NG": "/", en: "/", "x-default": "/" },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "/",
    siteName: SITE_NAME,
    title: "Oja Square — Shop Every Store on Oja",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Oja Square — Shop Every Store on Oja",
    description: SITE_DESCRIPTION,
    site: "@Ojacomng",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={sora.variable}>
      <body className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)] antialiased">
        <SiteJsonLd />
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
        <StickySellBanner />
      </body>
    </html>
  );
}
