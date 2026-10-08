import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Search } from "lucide-react";
import { getPosts } from "@/lib/data";
import { Badge, Breadcrumbs } from "@/components/ui";

export const metadata: Metadata = {
  title: "Safety Guides Kenya — PPE Buying Guides, EN Standards & Checklists",
  description:
    "Free PPE buying guides for Kenyan buyers: EN397 helmets, S1 vs S2 vs S3 boots, chemical gloves, respirators, construction compliance & industry checklists — each linked to exact products.",
  keywords: [
    "PPE buying guide Kenya", "EN397 explained", "S1 vs S2 vs S3 boots", "safety helmet guide",
    "chemical gloves guide", "construction safety Kenya", "workplace safety checklist Kenya",
  ],
  alternates: { canonical: "/resources" },
};

export const revalidate = 300;

export default async function ResourcesPage({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string }> }) {
  const sp = await searchParams;
  const posts = await getPosts();
  const cats = Array.from(new Set(posts.map((p) => p.category)));
  const q = (sp.q ?? "").toLowerCase();
  const list = posts.filter((p) =>
    (!sp.cat || p.category === sp.cat) &&
    (!q || `${p.title} ${p.excerpt}`.toLowerCase().includes(q))
  );

  return (
    <>
      <Breadcrumbs items={[{ label: "Resources" }]} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">Safety resources</h1>
      <p className="mt-2 max-w-2xl text-[15px] text-slate-600">Guides, standards explainers and checklists — each with a direct line to request the PPE mentioned.</p>

      <div className="mt-6 flex flex-wrap items-center gap-2.5">
        <form className="relative min-w-[220px] flex-1 sm:max-w-sm" action="/resources" method="get">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input name="q" defaultValue={sp.q ?? ""} placeholder="Search articles…" className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-safety-600" />
        </form>
        <Link href="/resources" className={`rounded-full px-4 py-2 text-[13px] font-bold ${!sp.cat ? "bg-navy-950 text-white" : "bg-mist text-slate-600"}`}>All</Link>
        {cats.map((c) => (
          <Link key={c} href={`/resources?cat=${encodeURIComponent(c)}`} className={`rounded-full px-4 py-2 text-[13px] font-bold ${sp.cat === c ? "bg-navy-950 text-white" : "bg-mist text-slate-600"}`}>{c}</Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {list.map((post) => (
          <Link key={post.slug} href={`/resources/${post.slug}`} className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl">
            <div className="relative h-44 overflow-hidden">
              {(post as any).image ? (
                <Image src={(post as any).image} alt={post.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-navy-950 via-navy-800 to-safety-700" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 to-transparent" />
              <span className="absolute bottom-3 left-4"><Badge tone="accent">{post.category}</Badge></span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h2 className="text-[16px] font-extrabold leading-snug text-navy-950 group-hover:text-safety-600">{post.title}</h2>
              <p className="mt-1.5 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">{post.excerpt}</p>
              <p className="mt-3 text-xs font-semibold text-slate-400">{post.author} • {post.date} • {post.readMins} min read</p>
              <p className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-safety-600 group-hover:text-accent-600">Read guide <ArrowRight size={15} /></p>
            </div>
          </Link>
        ))}
      </div>
      {list.length === 0 && <p className="mt-10 rounded-2xl bg-mist p-8 text-center text-sm text-slate-500">No articles match. Try another search.</p>}
      </div>
    </>
  );
}
