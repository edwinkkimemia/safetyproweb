import type { Metadata } from "next";
import { ShopClient } from "@/components/ShopClient";
import { Breadcrumbs } from "@/components/ui";
import { getProducts, getCategories, getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Shop PPE Online Kenya — Best Prices on Helmets, Boots & Gloves",
  description:
    "Shop 900+ PPE products online in Kenya: EN397 helmets, S3 boots, cut-resistant & nitrile gloves, FFP2 masks, coveralls, harnesses & extinguishers. VAT invoices, M-Pesa, 47-county delivery.",
  keywords: [
    "shop PPE Kenya", "buy safety equipment online Kenya", "safety helmets price Kenya",
    "S3 boots price Kenya", "nitrile gloves price Kenya", "respirators Kenya", "coveralls price Kenya",
  ],
  alternates: { canonical: "/shop" },
};

export const revalidate = 300;

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const sp = await searchParams;
  const [products, categories, settings] = await Promise.all([getProducts({}), getCategories(), getSettings()]);
  return (
    <>
      <Breadcrumbs items={[{ label: "Shop" }]} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">Shop PPE & Safety Equipment</h1>
      <p className="mt-1.5 max-w-2xl text-[15px] text-slate-600">Search by product name, SKU, brand, certification (e.g. EN397) or industry (e.g. oil and gas). Every price includes VAT guidance.</p>
      <div className="mt-6">
        <ShopClient products={products} categories={categories} waNumber={settings.whatsapp} initialQuery={sp.q ?? ""} />
      </div>
      </div>
    </>
  );
}
