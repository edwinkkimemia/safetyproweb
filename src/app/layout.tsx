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
    "Buy PPE online in Kenya at best prices: EN397 safety helmets, S3 steel-toe boots, cut-resistant & nitrile gloves, respirators, coveralls, fall protection & fire safety. LPO accepted, VAT invoices, M-Pesa & Kenya-wide delivery.",
  keywords: [
    "PPE Kenya", "safety equipment Kenya", "safety shop Nairobi", "buy PPE online Kenya",
    "safety helmets EN397", "hard hats Kenya", "S3 safety boots", "steel toe boots Kenya",
    "gumboots Kenya", "cut resistant gloves", "nitrile gloves Kenya", "chemical resistant gloves",
    "safety glasses Kenya", "safety goggles", "ear plugs", "ear muffs", "dust masks FFP2",
    "half face respirator A2P3", "coveralls Kenya", "hi-vis vests", "fall protection harness",
    "fire extinguishers Kenya", "first aid kits", "traffic cones", "bulk PPE Kenya",
    "corporate PPE procurement", "LPO suppliers Kenya", "safety training Kenya",
  ],
  openGraph: {
    type: "website",
    locale: "en_KE",
    siteName: "SAFETYPRO AFRICA",
    title: "SAFETYPRO AFRICA | Buy PPE Online in Kenya — Best Prices & Bulk Supply",
    description: "Buy certified PPE online in Kenya at best prices — EN397 helmets, S3 boots, gloves, respirators, coveralls & fire safety. LPO accepted, VAT invoices, Kenya-wide delivery.",
    images: [{ url: "/images/hero.jpg", width: 1600, height: 900, alt: "SAFETYPRO AFRICA — buy PPE online in Kenya" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SAFETYPRO AFRICA | Buy PPE Online in Kenya — Best Prices & Bulk Supply",
    description: "Buy certified PPE online in Kenya at best prices — EN397 helmets, S3 boots, gloves, respirators, coveralls & fire safety. LPO accepted, VAT invoices, Kenya-wide delivery.",
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
    telephone: "+254729396174",
    address: { "@type": "PostalAddress", addressLocality: "Nairobi", addressCountry: "KE" },
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
