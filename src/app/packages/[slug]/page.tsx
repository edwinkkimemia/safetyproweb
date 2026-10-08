import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2, FileText, Package } from "lucide-react";
import { getPackages, getSettings } from "@/lib/data";
import { kes } from "@/lib/format";
import { ProductCard } from "@/components/ProductCard";
import { Breadcrumbs } from "@/components/ui";

export const revalidate = 300;

export async function generateStaticParams() {
  const pkgs = await getPackages();
  return pkgs.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const pkg = (await getPackages()).find((p) => p.slug === slug);
  if (!pkg) return { title: "Package not found" };
  return {
    title: `${pkg.name} Kenya — ${kes(pkg.price)}/Worker + Bulk Discounts`,
    description: `${pkg.name}: ${pkg.blurb} Guide price ${kes(pkg.price)}/worker. Scaled pricing for 10–10,000 workers, LPO terms, VAT invoices & Kenya-wide delivery.`,
    keywords: [pkg.name, `${pkg.name} Kenya`, "PPE kits Kenya", "per worker PPE pricing Kenya", "bulk PPE Kenya"],
    alternates: { canonical: `/packages/${slug}` },
  };
}

export default async function PackageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [packages, settings] = await Promise.all([getPackages(), getSettings()]);
  const pkg = packages.find((p) => p.slug === slug);
  if (!pkg) notFound();
  return (
    <>
      <Breadcrumbs items={[{ label: "PPE Packages", href: "/packages" }, { label: pkg.name }]} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="relative mt-3 overflow-hidden rounded-3xl bg-navy-950 p-8 text-white sm:p-10">
        {pkg.items[0]?.image && (
          <>
            <Image src={pkg.items[0].image} alt={pkg.name} fill sizes="100vw" className="object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/80 to-navy-950/25" />
          </>
        )}
        <div className="relative">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent-500"><Package size={15} /> PPE package</p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{pkg.name}</h1>
        <p className="mt-2 max-w-2xl text-slate-200">{pkg.blurb}</p>
        <p className="mt-4 text-2xl font-extrabold text-accent-500">{kes(pkg.price)} <span className="text-sm font-medium text-slate-300">guide price per worker</span></p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={`/bulk-ppe?package=${pkg.slug}`} className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-6 py-3 text-sm font-extrabold uppercase text-navy-950 hover:bg-white"><FileText size={16} /> Get scaled quotation</Link>
        </div>
        </div>
      </div>
      <h2 className="mt-8 flex items-center gap-2 text-xl font-extrabold text-navy-950"><CheckCircle2 size={20} className="text-emerald-600" /> What&apos;s in the kit ({pkg.items.length} items)</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {pkg.items.map((p) => <ProductCard key={p.slug} p={p} waNumber={settings.whatsapp} />)}
      </div>
      </div>
    </>
  );
}
