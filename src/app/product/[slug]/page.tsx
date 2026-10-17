import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getProduct, getProducts, getSettings } from "@/lib/data";
import { kes } from "@/lib/format";
import { categoryName, getRelatedProducts, productImages } from "@/lib/catalog";
import { productKeywords, productFaqs, faqJsonLd } from "@/lib/seo";
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
  const certs = p.certifications.length ? ` (${p.certifications.join(", ")})` : "";
  return {
    title: `Buy ${p.name} Online in Kenya — ${kes(p.price)}`,
    description: `${p.name}${certs} — ${p.short} SKU ${p.sku}. Best price ${kes(p.price)}, VAT invoice, LPO terms, M-Pesa & 47-county delivery. In stock now.`,
    keywords: productKeywords({ name: p.name, brand: p.brand, category: p.category, certifications: p.certifications, sku: p.sku }),
    alternates: { canonical: `/product/${p.slug}` },
    openGraph: {
      title: `${p.name} — ${kes(p.price)} | SAFETYPRO AFRICA`, description: `${p.short} Buy online in Kenya. VAT invoice & Kenya-wide delivery.`, type: "website",
      ...(gallery.length ? { images: gallery.slice(0, 4).map((url) => ({ url, alt: p.name })) } : {}),
    },
    twitter: { card: "summary_large_image", title: `${p.name} — ${kes(p.price)}`, description: `${p.short} Buy online in Kenya.` },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();
  const [all, settings] = await Promise.all([getProducts({}), getSettings()]);
  const related = getRelatedProducts(p, all, 4);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://safetypro.co.ke";
  const faqs = productFaqs({ name: p.name, brand: p.brand, category: p.category, certifications: p.certifications, vatInclusive: p.vatInclusive });

  const productJsonLd = {    "@context": "https://schema.org",
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }} />

      <ProductDetailClient p={p} waNumber={settings.whatsapp} />

      {/* description + specs — side by side on desktop */}
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-2">
        <div id="product-description" className="scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <p className="text-[11.5px] font-extrabold uppercase tracking-[0.16em] text-safety-600">Product description</p>
          <h2 className="mt-1 text-xl font-extrabold tracking-tight text-navy-950 sm:text-2xl">About this product</h2>
          <div className="mt-4 space-y-4">
            {p.description.split(/\n\n+/).map((para, i) => (
              <p key={i} className={i === 0 ? "text-[16px] font-medium leading-relaxed text-navy-950" : "text-[15px] leading-relaxed text-slate-600"}>{para}</p>
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

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
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
      </div>

      {/* buyer FAQs — visible for shoppers, schema for Google + AI citations */}
      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <p className="text-[11.5px] font-extrabold uppercase tracking-[0.16em] text-safety-600">Buying {p.name}</p>
        <h2 className="mt-1 text-xl font-extrabold tracking-tight text-navy-950 sm:text-2xl">Delivery, VAT & bulk answers</h2>
        <div className="mt-4 divide-y divide-slate-100">
          {faqs.map((f) => (
            <details key={f.q} className="group py-3.5">
              <summary className="cursor-pointer list-none text-[15px] font-bold text-navy-950 transition group-hover:text-safety-600 [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-3">{f.q}<span className="shrink-0 text-xl font-light text-accent-500 group-open:rotate-45">+</span></span>
              </summary>
              <p className="mt-2 pr-8 text-[14.5px] leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
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
