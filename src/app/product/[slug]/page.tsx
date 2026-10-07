import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getProduct, getProducts, getSettings } from "@/lib/data";
import { kes } from "@/lib/format";
import { categoryName, getRelatedProducts, productImages } from "@/lib/catalog";
import { ProductDetailClient } from "@/components/ProductDetailClient";
import { ProductCard } from "@/components/ProductCard";
import { Badge, Breadcrumbs, SectionHead } from "@/components/ui";

export const revalidate = 300;

export async function generateStaticParams() {
  const all = await getProducts({});
  return all.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return { title: "Product not found" };
  const gallery = productImages(p);
  return {
    title: `${p.name} — ${kes(p.price)}`,
    description: `${p.short} SKU ${p.sku}. Buy online in Kenya with VAT invoice, M-Pesa & Kenya-wide delivery.`,
    alternates: { canonical: `/product/${p.slug}` },
    openGraph: {
      title: p.name, description: p.short, type: "website",
      ...(gallery.length ? { images: gallery.slice(0, 4).map((url) => ({ url, alt: p.name })) } : {}),
    },
    twitter: { card: "summary_large_image", title: p.name, description: p.short },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();
  const [all, settings] = await Promise.all([getProducts({}), getSettings()]);
  const related = getRelatedProducts(p, all, 4);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://safetypro.co.ke";

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: p.sku,
    description: p.short,
    brand: { "@type": "Brand", name: p.brand },
    category: categoryName(p.category),
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/product/${p.slug}`,
      priceCurrency: "KES",
      price: p.price,
      availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviews },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${siteUrl}/shop` },
      { "@type": "ListItem", position: 3, name: categoryName(p.category), item: `${siteUrl}/shop/${p.category}` },
      { "@type": "ListItem", position: 4, name: p.name },
    ],
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Shop", href: "/shop" },
          { label: categoryName(p.category), href: `/shop/${p.category}` },
          { label: p.name },
        ]}
      />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <ProductDetailClient p={p} waNumber={settings.whatsapp} />

      {/* description — prioritized: full width, first, proper paragraphs */}
      <div id="product-description" className="mt-8 scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 lg:p-10">
        <p className="text-[11.5px] font-extrabold uppercase tracking-[0.16em] text-safety-600">Product description</p>
        <h2 className="mt-1 max-w-3xl text-xl font-extrabold tracking-tight text-navy-950 sm:text-2xl">About this product</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2 lg:gap-8">
          {p.description.split(/\n\n+/).map((para, i) => (
            <p key={i} className={i === 0 ? "text-[16px] font-medium leading-relaxed text-navy-950 lg:col-span-2 lg:text-lg" : "text-[15px] leading-relaxed text-slate-600"}>{para}</p>
          ))}
        </div>
        {p.applications.length > 0 && (
          <>
            <h3 className="mt-6 text-[13px] font-extrabold uppercase tracking-widest text-slate-400">Typical applications</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {p.applications.map((a) => <Badge key={a} tone="grey">{a}</Badge>)}
            </div>
          </>
        )}
      </div>

      {/* specs */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <h2 className="bg-navy-950 px-6 py-4 text-[15px] font-extrabold uppercase tracking-wide text-white">Specifications</h2>
        <table className="w-full text-sm">
          <tbody>
            {p.specs.map((s, i) => (
              <tr key={s.key} className={i % 2 ? "bg-white" : "bg-mist"}>
                <td className="px-6 py-3 font-bold text-navy-950">{s.key}</td>
                <td className="px-6 py-3 text-slate-600">{s.value}</td>
              </tr>
            ))}
            <tr className="bg-white"><td className="px-6 py-3 font-bold text-navy-950">SKU</td><td className="px-6 py-3 font-mono text-slate-600">{p.sku}</td></tr>
            <tr className="bg-mist"><td className="px-6 py-3 font-bold text-navy-950">Brand</td><td className="px-6 py-3 text-slate-600">{p.brand}</td></tr>
          </tbody>
        </table>
        {p.certifications.length > 0 && (
          <div className="flex items-center gap-2 border-t border-slate-100 px-6 py-4 text-[13px] text-slate-500">
            <ShieldCheck size={16} className="text-safety-600" /> Standards on file: <strong className="text-navy-950">{p.certifications.join(", ")}</strong>
          </div>
        )}
      </div>

      {/* related */}
      {related.length > 0 && (
        <div className="mt-14">
          <SectionHead eyebrow="Complete the kit" title="Frequently bought together" sub="Crews issuing this item also order these complementary PPE lines." />
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {related.map((r) => <ProductCard key={r.slug} p={r} waNumber={settings.whatsapp} />)}
          </div>
        </div>
      )}
      </div>
    </>
  );
}
