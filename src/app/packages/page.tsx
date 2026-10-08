import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, FileText, Package } from "lucide-react";
import { getPackages, getSettings } from "@/lib/data";
import { kes } from "@/lib/format";
import { ProductCard } from "@/components/ProductCard";
import { Breadcrumbs } from "@/components/ui";

export const metadata: Metadata = {
  title: "PPE Kits Per Worker Kenya — Construction, Oil & Gas, Warehouse & Farm",
  description:
    "Ready-made PPE kits from KES/worker: construction starter, oil & gas, warehouse & flower farm packages. Standardised issue, volume discounts, LPO terms & Kenya-wide delivery.",
  keywords: [
    "PPE kits Kenya", "construction PPE kit price Kenya", "oil gas PPE kit", "warehouse PPE kit",
    "flower farm PPE kit", "per worker PPE pricing Kenya", "bulk PPE packages Kenya",
  ],
  alternates: { canonical: "/packages" },
};

export const revalidate = 300;

export default async function PackagesPage() {
  const [packages, settings] = await Promise.all([getPackages(), getSettings()]);
  return (
    <>
      <Breadcrumbs items={[{ label: "PPE Packages" }]} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">Ready-made PPE packages</h1>
      <p className="mt-2 max-w-2xl text-[15px] text-slate-600">Standardised per-worker kits with guide pricing. Request scaled pricing for your headcount.</p>
      <div className="mt-8 space-y-8">
        {packages.map((pkg) => (
          <article key={pkg.slug} id={pkg.slug} className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
            <div className="relative flex flex-wrap items-center justify-between gap-3 overflow-hidden bg-navy-950 p-6 text-white">
              {pkg.items[0]?.image && (
                <>
                  <Image src={pkg.items[0].image} alt={pkg.name} fill sizes="(max-width: 768px) 100vw, 80vw" className="object-cover opacity-40" />
                  <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/75 to-navy-950/20" />
                </>
              )}
              <div className="relative flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/25"><Package size={24} /></span>
                <div>
                  <h2 className="text-xl font-extrabold">{pkg.name}</h2>
                  <p className="text-sm text-slate-300">{pkg.blurb}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-300">Guide price / worker</p>
                <p className="text-2xl font-extrabold text-accent-500">{kes(pkg.price)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 p-6 sm:gap-4 lg:grid-cols-4">
              {pkg.items.map((p) => <ProductCard key={p.slug} p={p} waNumber={settings.whatsapp} />)}
            </div>
            <div className="flex flex-wrap gap-2.5 border-t border-slate-100 p-5">
              <Link href={`/packages/${pkg.slug}`} className="inline-flex items-center gap-1.5 rounded-xl bg-navy-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-safety-600">View kit detail <ArrowRight size={15} /></Link>
              <Link href={`/bulk-ppe?package=${pkg.slug}`} className="inline-flex items-center gap-1.5 rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-extrabold text-navy-950 hover:bg-accent-600 hover:text-white"><FileText size={15} /> Get scaled quotation</Link>
            </div>
          </article>
        ))}
      </div>
      <p className="mt-6 flex items-start gap-2 text-[13px] text-slate-500"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-600" /> Kit contents are editable by our team per tender — sizes, colours and brands adjust to your specification.</p>
      </div>
    </>
  );
}
