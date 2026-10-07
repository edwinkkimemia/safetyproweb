import type { Metadata } from "next";
import { ShopClient } from "@/components/ShopClient";
import { Breadcrumbs } from "@/components/ui";
import { getProducts, getCategories, getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Shop PPE & Safety Equipment",
  description: "Shop safety helmets, boots, gloves, respirators, coveralls, fire safety and site equipment online in Kenya. VAT invoices, M-Pesa & Kenya-wide delivery.",
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
