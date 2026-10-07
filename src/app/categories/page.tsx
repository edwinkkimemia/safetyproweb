import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getCategories, getProducts } from "@/lib/data";
import { CategoryIcon } from "@/components/ProductVisual";
import { Breadcrumbs } from "@/components/ui";

export const metadata: Metadata = {
  title: "PPE Categories",
  description: "Browse all PPE categories: head, foot, hand, eye, hearing, respiratory, clothing, fall, fire and site safety equipment in Kenya.",
};

export const revalidate = 300;

export default async function CategoriesPage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts({})]);
  return (
    <>
      <Breadcrumbs items={[{ label: "Categories" }]} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">Shop by category</h1>
      <p className="mt-2 max-w-2xl text-[15px] text-slate-600">Ten professional PPE ranges with sub-specialities — from EN397 helmets to solar site lighting.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => {
          const n = products.filter((p) => p.category === c.slug).length;
          return (
            <Link key={c.slug} href={`/shop/${c.slug}`} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl">
              <div className="relative h-40 overflow-hidden">
                {(c as any).image ? (
                  <Image src={(c as any).image} alt={c.name} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-r from-navy-950 to-safety-700" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/15 to-transparent" />
                <div className="absolute bottom-3.5 left-4 right-4 flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-500 text-navy-950">
                    <CategoryIcon icon={c.icon} />
                  </span>
                  <div>
                    <h2 className="text-[17px] font-extrabold leading-tight text-white">{c.name}</h2>
                    <p className="text-[11.5px] font-semibold text-slate-300">{n} product{n === 1 ? "" : "s"} in stock range</p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <p className="text-sm text-slate-600">{c.blurb}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.subs.map((s) => <span key={s} className="rounded-md bg-mist px-2 py-1 text-[11.5px] font-semibold text-slate-600 ring-1 ring-slate-200">{s}</span>)}
                </div>
                <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-safety-600 group-hover:text-accent-600">Shop {c.name.toLowerCase()} <ArrowRight size={15} /></p>
              </div>
            </Link>
          );
        })}
      </div>
      </div>
    </>
  );
}
