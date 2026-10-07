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
  return {
    title: `${name} Kenya`,
    description: `Buy ${name.toLowerCase()} online in Kenya — quality stock, VAT invoices, M-Pesa payment and Kenya-wide delivery from SAFETYPRO AFRICA.`,
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
