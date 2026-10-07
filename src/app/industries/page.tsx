import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, TriangleAlert, FileText } from "lucide-react";
import { getIndustries, getProducts, getSettings } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import { Breadcrumbs } from "@/components/ui";

export const metadata: Metadata = {
  title: "Industries We Serve",
  description: "PPE programmes for construction, oil & gas, manufacturing, flower farms, mining, logistics, healthcare and more across Kenya.",
};

export const revalidate = 300;

export default async function IndustriesPage() {
  const [industries, products, settings] = await Promise.all([getIndustries(), getProducts({}), getSettings()]);
  return (
    <>
      <Breadcrumbs items={[{ label: "Industries" }]} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">Industries we serve</h1>
      <p className="mt-2 max-w-2xl text-[15px] text-slate-600">Typical hazards, recommended PPE and relevant products per sector — plus a one-click industry PPE package request.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {industries.map((ind) => {
          const rel = products.filter((p) => p.industries.includes(ind.slug)).slice(0, 3);
          return (
            <article key={ind.slug} className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
              <div className="relative h-48 overflow-hidden">
                {(ind as any).image ? (
                  <Image src={(ind as any).image} alt={`${ind.name} PPE`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-r from-navy-950 to-safety-700" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/30 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5">
                  <h2 className="text-xl font-extrabold text-white">{ind.name}</h2>
                  <p className="mt-1 line-clamp-2 text-[13px] text-slate-200">{ind.blurb}</p>
                </div>
              </div>
              <div className="grid gap-4 p-6 sm:grid-cols-2">
                <div>
                  <h3 className="flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-widest text-red-500"><TriangleAlert size={14} /> Typical hazards</h3>
                  <ul className="mt-2 space-y-1.5 text-[13.5px] text-slate-600">
                    {ind.hazards.map((h) => <li key={h} className="flex gap-2"><span className="text-red-400">•</span> {h}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-widest text-emerald-600"><CheckCircle2 size={14} /> Recommended PPE</h3>
                  <ul className="mt-2 space-y-1.5 text-[13.5px] text-slate-600">
                    {(ind.ppe.length ? ind.ppe : rel.map((r) => r.name)).slice(0, 5).map((x) => <li key={x} className="flex gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" /> {x}</li>)}
                  </ul>
                </div>
              </div>
              {rel.length > 0 && (
                <div className="grid grid-cols-3 gap-2.5 px-6 pb-2">
                  {rel.map((p) => <ProductCard key={p.slug} p={p} waNumber={settings.whatsapp} />)}
                </div>
              )}
              <div className="flex flex-wrap gap-2.5 p-6">
                <Link href={`/industries/${ind.slug}`} className="inline-flex items-center gap-1.5 rounded-xl bg-navy-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-safety-600">Open {ind.name} playbook <ArrowRight size={15} /></Link>
                <Link href={`/bulk-ppe?industry=${encodeURIComponent(ind.name)}`} className="inline-flex items-center gap-1.5 rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-extrabold text-navy-950 hover:bg-accent-600 hover:text-white"><FileText size={15} /> Request industry package</Link>
              </div>
            </article>
          );
        })}
      </div>
      </div>
    </>
  );
}
