import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ShopClient } from "@/components/ShopClient";
import { Breadcrumbs } from "@/components/ui";
import { getProducts, getCategories, getSettings } from "@/lib/data";
import { categoryName, CATEGORY_IMAGES } from "@/lib/catalog";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const name = categoryName(category);
  const key = category.toLowerCase();
  const extra: Record<string, string> = {
    "head-protection": "EN397 helmets & hard hats",
    "foot-protection": "S3 steel-toe boots & gumboots",
    "hand-protection": "cut-resistant, nitrile & chemical gloves",
    "eye-face-protection": "safety glasses, goggles & face shields",
    "hearing-protection": "ear plugs & SNR-rated muffs",
    "respiratory-protection": "FFP2 dust masks & A2P3 respirators",
    "protective-clothing": "coveralls, hi-vis vests & rainwear",
    "fall-protection": "harnesses, lanyards & lifelines",
    "fire-emergency": "extinguishers, blankets & first aid kits",
    "road-site-safety": "cones, barricades & warning lights",
  };
  const hook = extra[key] ? `${extra[key]} at best prices` : "certified stock at best prices";
  return {
    title: `${name} — Buy Online in Kenya at Best Prices`,
    description: `Buy ${name.toLowerCase()} online in Kenya — ${hook}. VAT invoices, LPO terms, M-Pesa & 47-county delivery from SAFETYPRO AFRICA.`,
    keywords: [name, `${name} Kenya`, `${name} price Kenya`, `buy ${name.toLowerCase()} Nairobi`, "bulk PPE Kenya"],
    alternates: { canonical: `/shop/${category}` },
  };
}

export default async function CategoryShopPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const [products, categories, settings] = await Promise.all([getProducts({}), getCategories(), getSettings()]);
  if (!categories.some((c) => c.slug === category) && products.every((p) => p.category !== category)) notFound();
  return (
    <>
      <Breadcrumbs items={[{ label: "Shop", href: "/shop" }, { label: categoryName(category) }]} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="relative mt-3 overflow-hidden rounded-3xl bg-navy-950">
        {CATEGORY_IMAGES[category] && (
          <>
            <Image src={CATEGORY_IMAGES[category]} alt={categoryName(category)} fill sizes="100vw" className="object-cover opacity-45" />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/75 to-navy-950/20" />
          </>
        )}
        <div className="relative p-7 sm:p-9">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{categoryName(category)}</h1>
          <p className="mt-1.5 max-w-2xl text-[15px] text-slate-200">
            {categories.find((c) => c.slug === category)?.blurb ?? `Professional ${categoryName(category).toLowerCase()} stocked in Nairobi.`}
          </p>
        </div>
      </div>
      <div className="mt-6">
        <ShopClient products={products} categories={categories} waNumber={settings.whatsapp} initialCategory={category} />
      </div>
      </div>
    </>
  );
}
