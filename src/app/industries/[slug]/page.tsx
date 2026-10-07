import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, FileText, TriangleAlert } from "lucide-react";
import { getIndustries, getProducts, getSettings } from "@/lib/data";
import { waLink } from "@/lib/whatsapp";
import { ProductCard } from "@/components/ProductCard";
import { Breadcrumbs, WhatsAppIcon } from "@/components/ui";

export const revalidate = 300;

export async function generateStaticParams() {
  const inds = await getIndustries();
  return inds.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const ind = (await getIndustries()).find((i) => i.slug === slug);
  if (!ind) return { title: "Industry not found" };
  return {
    title: `${ind.name} PPE`,
    description: `${ind.blurb} Recommended PPE, hazards and package pricing in Kenya.`,
    alternates: { canonical: `/industries/${slug}` },
  };
}

const faqJson = (name: string, faqs: { q: string; a: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});

export default async function IndustryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [industries, products, settings] = await Promise.all([getIndustries(), getProducts({}), getSettings()]);
  const ind = industries.find((i) => i.slug === slug);
  if (!ind) notFound();
  const rel = products.filter((p) => p.industries.includes(slug));

  return (
    <>
      <Breadcrumbs items={[{ label: "Industries", href: "/industries" }, { label: ind.name }]} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJson(ind.name, [
        { q: `What PPE does ${ind.name.toLowerCase()} work require?`, a: ind.ppe.length ? ind.ppe.join(", ") : rel.slice(0, 5).map((r) => r.name).join(", ") },
        { q: "Do you offer bulk pricing for this industry?", a: "Yes — send your PPE list via the bulk quotation form for volume pricing, LPO terms and Kenya-wide delivery." },
      ])) }} />
      <div className="relative mt-3 overflow-hidden rounded-3xl bg-navy-950 p-8 text-white sm:p-10">
        {(ind as any).image && (
          <>
            <Image src={(ind as any).image} alt={`PPE for ${ind.name}`} fill sizes="100vw" className="object-cover opacity-45" />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/80 to-navy-950/25" />
          </>
        )}
        <div className="relative">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">PPE for {ind.name}</h1>
        <p className="mt-2 max-w-2xl text-slate-200">{ind.blurb}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={`/bulk-ppe?industry=${encodeURIComponent(ind.name)}`} className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-6 py-3 text-sm font-extrabold uppercase text-navy-950 hover:bg-white"><FileText size={16} /> Request industry PPE package</Link>
          <a href={waLink(`Hello SAFETYPRO AFRICA, I need a PPE package for ${ind.name}. Please advise.`)} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3 text-sm font-bold text-white hover:border-accent-500 hover:text-accent-500"><WhatsAppIcon size={16} /> WhatsApp an advisor</a>
        </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="flex items-center gap-2 font-extrabold text-navy-950"><TriangleAlert size={18} className="text-red-500" /> Typical hazards</h2>
          <ul className="mt-3 space-y-2 text-[15px] text-slate-600">
            {ind.hazards.map((h) => <li key={h} className="flex gap-2.5 rounded-xl bg-red-50/60 px-3.5 py-2.5 ring-1 ring-red-100"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" /> {h}</li>)}
          </ul>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="flex items-center gap-2 font-extrabold text-navy-950"><CheckCircle2 size={18} className="text-emerald-600" /> Recommended PPE</h2>
          <ul className="mt-3 space-y-2 text-[15px] text-slate-600">
            {(ind.ppe.length ? ind.ppe : rel.map((r) => r.name)).slice(0, 8).map((x) => (
              <li key={x} className="flex gap-2.5 rounded-xl bg-emerald-50/60 px-3.5 py-2.5 ring-1 ring-emerald-100"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" /> {x}</li>
            ))}
          </ul>
        </div>
      </div>

      {rel.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-extrabold text-navy-950">Relevant products for {ind.name.toLowerCase()}</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {rel.slice(0, 8).map((p) => <ProductCard key={p.slug} p={p} waNumber={settings.whatsapp} />)}
          </div>
        </div>
      )}

      <div className="mt-10 rounded-3xl bg-mist p-8 text-center">
        <h2 className="text-xl font-extrabold text-navy-950">Need a full {ind.name.toLowerCase()} PPE schedule?</h2>
        <p className="mx-auto mt-1 max-w-xl text-sm text-slate-500">Send headcount, sites and your current PPE list — we return a line-item quotation with sizes and delivery plan.</p>
        <Link href="/bulk-ppe" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-navy-950 px-6 py-3 text-sm font-bold text-white hover:bg-safety-600">Start bulk request <ArrowRight size={15} /></Link>
      </div>
      </div>
    </>
  );
}
