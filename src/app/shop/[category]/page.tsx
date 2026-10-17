import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ShopClient } from "@/components/ShopClient";
import { Breadcrumbs } from "@/components/ui";
import { getProducts, getCategories, getSettings } from "@/lib/data";
import { categoryName, CATEGORY_IMAGES } from "@/lib/catalog";
import { CATEGORY_HOOKS, categoryKeywords, categoryFaqs, faqJsonLd, itemListJsonLd } from "@/lib/seo";
import { kes } from "@/lib/format";
import Link from "next/link";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const name = categoryName(category);
  const key = category.toLowerCase();
  const hook = CATEGORY_HOOKS[key] ? `${CATEGORY_HOOKS[key]} at best prices` : "certified stock at best prices";
  return {
    title: `${name} — Buy Online in Kenya at Best Prices`,
    description: `Buy ${name.toLowerCase()} online in Kenya — ${hook}. VAT invoices, LPO terms, M-Pesa & 47-county delivery from SAFETYPRO AFRICA.`,
    keywords: categoryKeywords(name, key),
    alternates: { canonical: `/shop/${category}` },
  };
}

export default async function CategoryShopPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const [products, categories, settings] = await Promise.all([getProducts({}), getCategories(), getSettings()]);
  if (!categories.some((c) => c.slug === category) && products.every((p) => p.category !== category)) notFound();
  const inCat = products.filter((p) => p.category === category);
  const count = inCat.length;
  const from = inCat.length ? kes(Math.min(...inCat.map((p) => p.price))) : undefined;
  const faqs = categoryFaqs(categoryName(category), category, count, from);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd(inCat.slice(0, 20).map((p) => ({ name: p.name, url: `/product/${p.slug}`, price: p.price })))) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }} />
      <Breadcrumbs items={[{ label: "Shop", href: "/shop" }, { label: categoryName(category) }]} />
      {/* full-bleed hero — square edges, image background, no card whitespace */}
      <div className="relative overflow-hidden bg-navy-950">
        {CATEGORY_IMAGES[category] && (
          <>
            <Image src={CATEGORY_IMAGES[category]} alt={categoryName(category)} fill priority sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/70 to-navy-950/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-transparent to-transparent" />
          </>
        )}
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-accent-500">
            Shop{count > 0 ? ` • ${count} product${count === 1 ? "" : "s"}` : ""}
          </p>
          <h1 className="mt-2 max-w-2xl text-3xl font-extrabold tracking-tight text-white text-balance sm:text-4xl lg:text-5xl">
            {categoryName(category)}
          </h1>
          <p className="mt-2.5 max-w-2xl text-[15px] leading-relaxed text-slate-200">
            {categories.find((c) => c.slug === category)?.blurb ?? `Professional ${categoryName(category).toLowerCase()} stocked in Nairobi.`}
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ShopClient products={products} categories={categories} waNumber={settings.whatsapp} initialCategory={category} />

        {/* SEO buying guide — keyword-rich copy + internal links + FAQs */}
        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
            <p className="text-[11.5px] font-extrabold uppercase tracking-[0.16em] text-safety-600">Buying guide</p>
            <h2 className="mt-1 text-xl font-extrabold tracking-tight text-navy-950 sm:text-2xl">
              Buy {categoryName(category).toLowerCase()} online in Kenya{from ? ` — from ${from}` : ""}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
              SAFETYPRO AFRICA stocks {count} {categoryName(category).toLowerCase()} lines in Nairobi
              {CATEGORY_HOOKS[category] ? ` — ${CATEGORY_HOOKS[category].toLowerCase()}` : ""} — certified stock with
              standards held on file for audit and tender compliance. Order online for same-day Nairobi pickup or
              24–72h upcountry dispatch to all 47 counties, with VAT invoices on every order and LPO terms for approved
              corporate accounts. Equipping 10+ workers?{" "}
              <Link href="/bulk-ppe" className="font-bold text-safety-600 hover:text-accent-600">Request volume pricing</Link>{" "}
              or browse <Link href="/packages" className="font-bold text-safety-600 hover:text-accent-600">ready-made PPE kits per worker</Link>.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="text-xl font-extrabold tracking-tight text-navy-950">{categoryName(category)} FAQs</h2>
            <div className="mt-2 divide-y divide-slate-100">
              {faqs.map((f) => (
                <details key={f.q} className="group py-3">
                  <summary className="cursor-pointer list-none text-[14.5px] font-bold text-navy-950 transition group-hover:text-safety-600 [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center justify-between gap-3">{f.q}<span className="shrink-0 text-lg font-light text-accent-500 group-open:rotate-45">+</span></span>
                  </summary>
                  <p className="mt-1.5 pr-6 text-[13.5px] leading-relaxed text-slate-600">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
