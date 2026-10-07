import type { Metadata, Viewport } from "next";
import { Inter, Poppins, Roboto, Open_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBottomNav, WhatsAppFloat } from "@/components/Floating";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", weight: ["400", "500", "600", "700"] });
const poppins = Poppins({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600", "700"] });
const roboto = Roboto({ subsets: ["latin"], variable: "--font-roboto", weight: ["400", "500", "700"] });
const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-open-sans", weight: ["400", "600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://safetypro.co.ke"),
  title: {
    default: "SAFETYPRO AFRICA | PPE & Workplace Safety Equipment Kenya",
    template: "%s | SAFETYPRO AFRICA",
  },
  description:
    "Kenya's professional PPE supplier: safety helmets, safety boots, gloves, respirators, coveralls, fire safety & bulk corporate procurement with Kenya-wide delivery.",
  keywords: ["PPE Kenya", "safety equipment Nairobi", "safety boots", "safety helmets EN397", "bulk PPE", "corporate procurement"],
  openGraph: {
    type: "website",
    locale: "en_KE",
    siteName: "SAFETYPRO AFRICA",
    title: "SAFETYPRO AFRICA | PPE & Workplace Safety Equipment Kenya",
    description: "Quality PPE, industrial safety equipment and workplace protection solutions supplied across Kenya.",
    images: [{ url: "/images/hero.jpg", width: 1600, height: 900, alt: "SAFETYPRO AFRICA — PPE & workplace safety Kenya" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SAFETYPRO AFRICA | PPE & Workplace Safety Equipment Kenya",
    description: "Quality PPE, industrial safety equipment and workplace protection solutions supplied across Kenya.",
    images: ["/images/hero.jpg"],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/logo/favicon.png", type: "image/png" }],
    apple: [{ url: "/logo/favicon.png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#011951",
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://safetypro.co.ke";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SAFETYPRO AFRICA",
    url: SITE_URL,
    logo: `${SITE_URL}/logo/logo.png`,
    slogan: "Protecting People. Powering Safer Workplaces.",
    email: "info@safetypro.co.ke",
    telephone: "+254715135141",
    address: { "@type": "PostalAddress", streetAddress: "Enterprise Road, Industrial Area", addressLocality: "Nairobi", addressCountry: "KE" },
  };
  const siteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SAFETYPRO AFRICA",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/shop?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${roboto.variable} ${openSans.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-white">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }} />
        <Providers>
          <Header />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <Footer />
          <WhatsAppFloat />
          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  );
}
