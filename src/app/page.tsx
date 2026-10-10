import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, Building2, CheckCircle2, ClipboardList,
  Factory, FileText, HardHat, Minus, Package,
  Phone, ShieldCheck, Sprout, Star, Trophy, Truck, ChevronRight, XCircle,
  type LucideIcon,
} from "lucide-react";
import { getProducts, getCategories, getIndustries, getPackages, getPosts, getSettings } from "@/lib/data";
import { BULK_CTA_IMAGE, ALL_PRODUCTS, shuffle } from "@/lib/catalog";
import { kes } from "@/lib/format";
import { waLink } from "@/lib/whatsapp";
import { DealCard, ProductCard } from "@/components/ProductCard";
import { CategoryIcon, ProductVisual } from "@/components/ProductVisual";
import { HeroSlider, HeroSideCard } from "@/components/Hero";
import { Badge, Button, SectionHead, WhatsAppIcon } from "@/components/ui";
import type { Metadata } from "next";

// Always fresh: picks are reshuffled every hit, so no caching.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Buy PPE Online in Kenya — Helmets, Boots, Gloves & Bulk Supply",
  description:
    "Kenya's #1 PPE shop: EN397 helmets, S3 boots, cut-resistant gloves, respirators, coveralls & fire safety at best prices. LPO & 30-day terms, VAT invoices, M-Pesa, 47-county delivery.",
  keywords: [
    "buy PPE online Kenya", "PPE Kenya", "safety shop Nairobi", "safety helmets EN397",
    "S3 safety boots Kenya", "cut resistant gloves", "respirators Kenya", "coveralls Kenya",
    "bulk PPE Kenya", "corporate PPE procurement Kenya", "LPO suppliers Kenya",
  ],
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [featuredPool, allProducts, categories, industries, packages, posts, settings] = await Promise.all([
    getProducts({ featured: true, limit: 24 }),
    getProducts({ limit: 60 }),
    getCategories(),
    getIndustries(),
    getPackages(),
    getPosts(),
    getSettings(),
  ]);
  const wa = settings.whatsapp;

  // Reshuffled every hit: same sections, fresh products on every refresh.
  const featured = shuffle(featuredPool).slice(0, 8);
  // Product-first derivations (packages demoted to a slim strip below).
  const deals = allProducts
    .filter((p) => p.compareAt && p.compareAt > p.price)
    .sort((a, b) => 1 - b.price / (b.compareAt ?? b.price) - (1 - a.price / (a.compareAt ?? a.price)))
    .slice(0, 12);
  const dealsFallback = shuffle(deals.length > 0 ? deals : featuredPool).slice(0, 4);
  const fresh = allProducts.filter((p) => p.isNew);
  const newPool = fresh.length >= 4 ? fresh : [...allProducts].sort((a, b) => b.rating - a.rating).slice(0, 12);
  const newArrivals = shuffle(newPool).slice(0, 4);
  const kitFrom = packages.length > 0 ? Math.min(...packages.map((p) => p.price)) : 0;

  // Homepage articles — 3 random picks, reshuffled every hit.
  const homePosts = shuffle(posts).slice(0, 3);

  // Essentials by category — product-first task row.
  const picksFor = (slug: string, n = 3) => shuffle(allProducts.filter((p) => p.category === slug)).slice(0, n);
  const essentials = [
    { slug: "head-protection", title: "Head protection", blurb: "Helmets & hard hats" },
    { slug: "foot-protection", title: "Foot protection", blurb: "S3 boots & gumboots" },
    { slug: "hand-protection", title: "Hand protection", blurb: "Gloves for every task" },
  ].map((g) => ({ ...g, items: picksFor(g.slug) }));

  return (
    <>
      {/* ============ HERO: categories | slider | spotlights ============ */}
      <section className="bg-mist">
        <div className="mx-auto max-w-7xl px-4 py-3 lg:h-[calc(100svh-192px)] lg:min-h-[430px] lg:max-h-[620px] lg:py-5">
          <div className="grid items-stretch gap-4 lg:h-full lg:grid-cols-[236px_minmax(0,1fr)_256px]">
            {/* LEFT: category rail */}
            <aside className="hidden lg:block">
              <nav className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
                <p className="bg-navy-950 px-4 py-3 text-[11.5px] font-extrabold uppercase tracking-[0.14em] text-white">
                  Shop by category
                </p>
                <ul className="nice-scroll max-h-[330px] flex-1 overflow-y-auto py-1.5 lg:max-h-none">
                  {categories.slice(0, 10).map((c) => (
                    <li key={c.slug}>
                      <Link href={`/shop/${c.slug}`} className="group flex items-center gap-2.5 px-3.5 py-[9px] text-[13.5px] font-semibold text-slate-600 transition hover:bg-safety-50 hover:text-navy-950">
                        <span className="text-safety-600 [&>svg]:h-5 [&>svg]:w-5 group-hover:text-accent-600"><CategoryIcon icon={c.icon} /></span>
                        <span className="flex-1 truncate">{c.name}</span>
                        <ChevronRight size={14} className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-accent-600" />
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href="/categories" className="border-t border-slate-100 px-4 py-2.5 text-[12.5px] font-extrabold uppercase tracking-wide text-safety-600 transition hover:text-accent-600">
                  View all categories →
                </Link>
              </nav>
            </aside>

            {/* MIDDLE: promo slider */}
            <HeroSlider
              slides={[
                {
                  image: "/hero/hero1.jpg",
                  eyebrow: "Kenya's professional PPE supplier",
                  title: "Protect Your Team.",
                  accent: "Equip Your Workplace.",
                  sub: "Quality PPE and site safety equipment for construction, oil & gas, manufacturing, agriculture and logistics — supplied across Kenya.",
                  cta: "Shop PPE",
                  href: "/shop",
                },
                {
                  image: "/hero/hero4.jpg",
                  eyebrow: "Bulk & corporate supply",
                  title: "One Supplier for",
                  accent: "Your Entire Workforce.",
                  sub: "Volume pricing, LPO terms for approved accounts, size schedules and Kenya-wide delivery.",
                  cta: "Request a quote",
                  href: "/bulk-ppe",
                },
                {
                  image: "/hero/hero2.jpg",
                  eyebrow: "Kenya-wide delivery",
                  title: "Stocked in Nairobi.",
                  accent: "Delivered Everywhere.",
                  sub: "Same-day pickup and 24–72h upcountry dispatch on high-turnover safety lines.",
                  cta: "Shop best sellers",
                  href: "/shop",
                },
                {
                  image: "/hero/hero3.jpg",
                  eyebrow: "Flower farms & agriculture",
                  title: "Field-Tested PPE",
                  accent: "for Farms & Greenhouses.",
                  sub: "Chemical gloves, spray goggles, respirators and coveralls trusted from Naivasha to Nanyuki.",
                  cta: "Explore farm PPE",
                  href: "/industries/flower-farms",
                },
              ]}
            />

            {/* RIGHT: spotlight deals */}
            <div className="hidden h-full flex-col gap-3 lg:flex">
              <div className="flex items-center justify-between px-0.5">
                <p className="text-[11.5px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Top deals</p>
                <Link href="/shop" className="text-[12px] font-bold text-safety-600 hover:text-accent-600">More →</Link>
              </div>
              <div className="grid flex-1 grid-rows-2 gap-3">
                {featured.slice(0, 2).map((p) => <HeroSideCard key={p.slug} p={p} />)}
              </div>
            </div>
          </div>

          {/* mobile / tablet: category chips + spotlights */}
          <div className="nice-scroll mt-2 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {categories.map((c) => (
              <Link key={c.slug} href={`/shop/${c.slug}`} className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-bold text-navy-950">
                {c.name}
              </Link>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:mx-auto sm:max-w-xl lg:hidden">
            {featured.slice(0, 2).map((p) => <HeroSideCard key={p.slug} p={p} />)}
          </div>
        </div>
      </section>

      {/* ============ FEATURED PRODUCTS ============ */}
      <section className="mx-auto max-w-7xl px-4 py-14 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHead eyebrow="Featured products" title="Site-ready best sellers" sub="High-turnover PPE lines stocked in Nairobi for immediate dispatch and corporate issue." />
          <Link href="/shop" className="inline-flex items-center gap-1.5 rounded-xl bg-navy-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-safety-600">View all products <ArrowRight size={16} /></Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {featured.map((p) => <ProductCard key={p.slug} p={p} waNumber={wa} compact />)}
        </div>
      </section>

      {/* ============ SHOP BY CATEGORY ============ */}
      <section className="bg-mist">
        <div className="mx-auto max-w-7xl px-4 py-14 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHead eyebrow="Shop by category" title="Every hazard covered, one supplier" sub="From head to toe and site to road — browse the full PPE range trusted by Kenyan contractors and institutions." />
          <Link href="/categories" className="inline-flex items-center gap-1.5 text-sm font-bold text-safety-600 hover:text-accent-600">All categories <ArrowRight size={16} /></Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4">
          {categories.slice(0, 10).map((c) => (
            <Link key={c.slug} href={`/shop/${c.slug}`}
              className="group overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-safety-600/40 hover:shadow-xl">
              <div className="relative h-28 overflow-hidden">
                {(c as any).image ? (
                  <Image src={(c as any).image} alt={c.name} fill sizes="(max-width: 640px) 50vw, 20vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-navy-950 to-safety-700" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/20 to-transparent" />
                <span className="absolute bottom-2 left-2.5 flex items-center gap-1.5 text-[13.5px] font-extrabold text-white">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-500 text-navy-950"><CategoryIcon icon={c.icon} /></span>
                  {c.name}
                </span>
              </div>
              <div className="p-3.5">
                <p className="line-clamp-2 min-h-[2.5em] text-xs leading-relaxed text-slate-500">{c.blurb}</p>
                <p className="mt-1 truncate text-[11px] font-semibold text-slate-400">{c.subs.slice(0, 2).join(" • ")}</p>
                <p className="mt-2 inline-flex items-center gap-1 text-[13px] font-bold text-safety-600 group-hover:text-accent-600">Shop now <ChevronRight size={14} /></p>
              </div>
            </Link>
          ))}
        </div>
        </div>
      </section>

      {/* ============ TOP DEALS — square-frame deal cards ============ */}
      <section className="mx-auto max-w-7xl px-4 py-14 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHead eyebrow="Top deals" title="Biggest savings right now" sub="Discounted certified stock — same VAT invoice and Kenya-wide delivery, while stock lasts." />
          <Link href="/shop" className="inline-flex items-center gap-1.5 rounded-xl bg-navy-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-safety-600">Shop all deals <ArrowRight size={16} /></Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {dealsFallback.map((p) => <DealCard key={p.slug} p={p} />)}
        </div>
      </section>

      {/* ============ NEW ARRIVALS — product-first ============ */}
      <section className="bg-mist">
        <div className="mx-auto max-w-7xl px-4 py-14 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHead eyebrow="New arrivals" title="Fresh stock, latest specs" sub="Newly stocked PPE lines added to our Nairobi warehouse — be first to kit your team." />
            <Link href="/shop" className="inline-flex items-center gap-1.5 text-sm font-bold text-safety-600 hover:text-accent-600">Shop new in <ArrowRight size={16} /></Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {newArrivals.map((p) => <ProductCard key={p.slug} p={p} waNumber={wa} compact />)}
          </div>
        </div>
      </section>

      {/* ============ ESSENTIALS BY CATEGORY — product-first ============ */}
      <section className="mx-auto max-w-7xl px-4 py-14 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHead eyebrow="Essentials by task" title="Start with what crews buy most" sub="Top picks per trade — open a category for sizes, specs and volume pricing." />
          <Link href="/categories" className="inline-flex items-center gap-1.5 text-sm font-bold text-safety-600 hover:text-accent-600">All categories <ArrowRight size={16} /></Link>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {essentials.map((g) => (
            <div key={g.slug} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center justify-between bg-navy-950 px-5 py-4 text-white">
                <div>
                  <h3 className="font-extrabold">{g.title}</h3>
                  <p className="text-xs text-slate-400">{g.blurb}</p>
                </div>
                <Link href={`/shop/${g.slug}`} className="inline-flex items-center gap-1 text-[13px] font-bold text-accent-500 hover:text-white">Shop <ArrowRight size={14} /></Link>
              </div>
              <ul className="divide-y divide-slate-100">
                {g.items.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/product/${p.slug}`} className="group flex items-center gap-3 px-4 py-3 transition hover:bg-mist">
                      <ProductVisual category={p.category} name={p.name} image={p.image} fit="contain" iconSize={22} className="h-14 w-14 shrink-0 rounded-xl border border-slate-100" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-bold text-navy-950 group-hover:text-safety-600">{p.name}</span>
                        <span className="mt-0.5 block truncate text-xs text-slate-500">{p.short?.slice(0, 60) ?? `${p.brand} • In stock`}</span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-[15px] font-extrabold text-navy-950">{kes(p.price)}</span>
                        {p.compareAt && <span className="block text-xs text-slate-400 line-through">{kes(p.compareAt)}</span>}
                      </span>
                      <ChevronRight size={16} className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-accent-600" />
                    </Link>
                  </li>
                ))}
                {g.items.length === 0 && <li className="px-5 py-4 text-sm text-slate-500">Stock landing soon — <Link href={`/shop/${g.slug}`} className="font-bold text-safety-600">browse category</Link>.</li>}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ============ KITS STRIP — demoted, links out ============ */}
      <section className="mx-auto max-w-7xl px-4 py-10 lg:py-12">
        <div className="flex flex-col items-start justify-between gap-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:p-7">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-950 text-accent-500"><Package size={22} /></span>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-safety-600">Need kits for 10+ workers?</p>
              <h2 className="mt-1 text-xl font-extrabold tracking-tight text-navy-950 sm:text-2xl">Ready-made PPE kits {kitFrom > 0 && <span className="text-slate-500">from {kes(kitFrom)}/worker</span>}</h2>
              <p className="mt-1 text-sm text-slate-500">{packages.length} standard kits • standardised issue, budgeting and re-orders.</p>
            </div>
          </div>
          <Link href="/packages" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-navy-950 px-6 py-3 text-sm font-bold text-white hover:bg-safety-600">Browse kits <ArrowRight size={16} /></Link>
        </div>
      </section>

      {/* ============ INDUSTRIES ============ */}
      <section className="bg-navy-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 lg:py-20">
          <SectionHead dark eyebrow="Industries we serve" title="PPE matched to your site hazards" sub="Fourteen sectors, one procurement partner. Open your industry playbook for hazards, recommended PPE and package pricing." />
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
            {industries.slice(0, 8).map((ind) => (
              <Link key={ind.slug} href={`/industries/${ind.slug}`} className="group overflow-hidden rounded-lg border border-white/10 bg-white/[0.05] backdrop-blur transition hover:border-accent-500/60 hover:bg-white/[0.09]">
                <div className="relative h-28 overflow-hidden">
                  {(ind as any).image ? (
                    <Image src={(ind as any).image} alt={ind.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-safety-700 to-navy-950" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 to-transparent" />
                  <span className="absolute bottom-2 left-3 flex h-9 w-9 items-center justify-center rounded-xl bg-accent-500 text-navy-950">
                    {ind.slug.includes("construct") || ind.slug.includes("mining") ? <HardHat size={20} /> : ind.slug.includes("farm") || ind.slug.includes("agri") ? <Sprout size={20} /> : ind.slug.includes("manufact") || ind.slug.includes("engineer") ? <Factory size={20} /> : <Building2 size={20} />}
                  </span>
                </div>
                <div className="p-4 pt-3">
                <h3 className="font-extrabold">{ind.name}</h3>
                <p className="mt-1 line-clamp-2 text-[13px] text-slate-400">{ind.blurb}</p>
                <p className="mt-2 inline-flex items-center gap-1 text-[13px] font-bold text-accent-500">View PPE package <ArrowRight size={14} /></p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/industries" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-sm font-bold text-white hover:border-accent-500 hover:text-accent-500">View all 14 industries <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* ============ BULK PROCUREMENT CTA ============ */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-14 lg:py-20">
          <div className="relative overflow-hidden rounded-xl bg-accent-500 p-8 text-navy-950 sm:p-12">
            <div className="texture-diagonal absolute inset-0 opacity-20" />
            <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <Badge tone="navy">Bulk & Corporate Procurement</Badge>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">Equip your entire workforce through one reliable safety supplier.</h2>
                <ul className="mt-4 grid gap-2 text-[15px] font-semibold sm:grid-cols-2">
                  {["Volume pricing on 10–10,000 units", "LPO & 30-day terms (approved)", "Size schedules per employee", "Delivery to any Kenyan county"].map((t) => (
                    <li key={t} className="flex items-start gap-2"><CheckCircle2 size={18} className="mt-0.5 shrink-0" /> {t}</li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/bulk-ppe" className="inline-flex items-center gap-2 rounded-xl bg-navy-950 px-7 py-3.5 text-sm font-extrabold uppercase tracking-wide text-white hover:bg-navy-800"><FileText size={17} /> Request corporate quotation</Link>
                  <a href={waLink("Hello SAFETYPRO AFRICA, I have a PPE list for quotation. How do I send it?")} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-6 py-3.5 text-sm font-extrabold text-navy-950 hover:bg-white"><WhatsAppIcon size={17} /> WhatsApp our team</a>
                </div>
              </div>
              <div className="overflow-hidden rounded-lg bg-navy-950 text-white shadow-2xl">
                <div className="relative h-44">
                  <Image src={BULK_CTA_IMAGE} alt="Procurement team reviewing a bulk PPE order" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/30 to-transparent" />
                  <p className="absolute bottom-3 left-5 text-xs font-bold uppercase tracking-widest text-accent-500">Have a long PPE list?</p>
                </div>
                <div className="p-6 pt-4">
                <p className="mt-1 text-lg font-extrabold leading-snug">Upload Excel, CSV or PDF — we prepare the quotation.</p>
                <div className="mt-4 space-y-2 text-sm text-slate-300">
                  {["BOQ & tender schedules welcome", "Response within 1 business day", "Framework pricing available"].map((t) => (
                    <p key={t} className="flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-400" /> {t}</p>
                  ))}
                </div>
                <Link href="/bulk-ppe" className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-accent-500 py-3 text-sm font-extrabold uppercase text-navy-950 hover:bg-white">Upload PPE list <ArrowRight size={16} /></Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CORPORATE PRICE ASSURANCE + CAPABILITY TABLE ============ */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="relative overflow-hidden rounded-xl bg-navy-950 p-8 text-white sm:p-12">
          <div className="hero-grid absolute inset-0" />
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent-500/20 blur-[90px]" />
          <div className="relative">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-widest text-accent-500 ring-1 ring-white/15">
              <Trophy size={14} /> Corporate price assurance
            </p>
            <h2 className="mt-4 max-w-3xl text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
              Equipping 10 or 10,000 workers? <span className="text-accent-500">Get structured, like-for-like value.</span>
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-300">
              Send your BOQ, tender schedule or supplier quote for identical certified specifications — we return a transparent line-item comparison with volume tiers, lead times and VAT treatment within one business day.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={waLink("Hello SAFETYPRO AFRICA, I would like a corporate price review for our PPE schedule: ")} target="_blank" rel="noopener"
                className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 text-sm font-extrabold uppercase tracking-wide text-white transition hover:brightness-110">
                <WhatsAppIcon /> Share BOQ on WhatsApp
              </a>
              <Link href="/bulk-ppe" className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-6 py-3.5 text-sm font-extrabold uppercase tracking-wide text-navy-950 transition hover:bg-white">
                <FileText size={17} /> Request corporate quote
              </Link>
            </div>
          </div>
        </div>

        {/* capability table */}
        <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="grid grid-cols-[1.2fr_1fr_1fr] items-center gap-2 bg-mist px-4 py-4 text-center sm:px-6">
            <p className="text-left text-[12px] font-extrabold uppercase tracking-widest text-slate-400">Corporate supply capability</p>
            <p className="flex items-center justify-center gap-1.5 rounded-xl bg-navy-950 px-2 py-2.5 text-[13px] font-extrabold text-white sm:text-sm"><Trophy size={16} className="shrink-0 text-accent-500" /> SAFETYPRO</p>
            <p className="rounded-xl bg-slate-200/70 px-2 py-2.5 text-[12px] font-bold text-slate-500 sm:text-sm">Typical retail suppliers</p>
          </div>
          {[
            [`${ALL_PRODUCTS.length}+ certified lines, one LPO & invoice`, "yes", "no"],
            ["Line-item BOQ quotation in 24 hours", "yes", "part"],
            ["LPO & 30-day terms for approved accounts", "yes", "no"],
            ["Size schedules & site delivery coordination", "yes", "no"],
            ["VAT invoice + delivery notes on every order", "yes", "part"],
            ["Framework pricing for repeat orders", "yes", "no"],
          ].map(([label, us, them]) => (
            <div key={label as string} className="grid grid-cols-[1.2fr_1fr_1fr] items-center gap-2 border-t border-slate-100 px-4 py-3.5 text-center sm:px-6">
              <p className="text-left text-[13.5px] font-bold text-navy-950">{label}</p>
              <p className="flex justify-center">{us === "yes" ? <CheckCircle2 size={22} className="text-emerald-500" /> : <Minus size={22} className="text-amber-500" />}</p>
              <p className="flex justify-center">{them === "yes" ? <CheckCircle2 size={22} className="text-emerald-500" /> : them === "part" ? <Minus size={22} className="text-amber-500" /> : <XCircle size={22} className="text-red-400" />}</p>
            </div>
          ))}
          <div className="border-t border-slate-100 bg-mist px-4 py-4 text-center sm:px-6">
            <Link href="/shop" className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-navy-950 transition hover:bg-navy-950 hover:text-white">
              Shop the widest range <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ WHY SAFETYPRO ============ */}
      <section className="bg-mist">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <SectionHead align="center" eyebrow="Why SafetyPro Africa" title="Built for procurement teams, trusted on site" sub="The documentation, consistency and responsiveness corporate HSE and procurement officers actually audit." />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {([
              ["Certified stock, on file", "EN/ISO references listed per product with standards held on file for audit and tender compliance.", ShieldCheck],
              ["Procurement-grade quotes", "Line-item BOQs with specs, sizes, lead times and VAT — ready to attach to your LPO.", ClipboardList],
              ["LPO & framework terms", "30-day terms for approved accounts, framework pricing and repeat-order schedules.", Building2],
              ["Coordinated delivery", "Size schedules per employee, Nairobi pickup and tracked dispatch to all 47 counties.", Truck],
            ] as [string, string, LucideIcon][]).map(([t, d, Icon]) => (
              <div key={t} className="rounded-lg border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-950 text-accent-500"><Icon size={20} /></span>
                <h3 className="mt-3 font-extrabold text-navy-950">{t}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{d}</p>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center justify-center gap-2 text-[11.5px] font-bold uppercase tracking-wider text-slate-500">
            {["EN397", "EN ISO 20345 S3", "EN166", "EN149", "ISO 45001 aligned", "KEBS", "KRA VAT compliant"].map((s) => (
              <span key={s} className="rounded-full border border-slate-200 bg-white px-3 py-1.5">{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PROCUREMENT PROOF ============ */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <SectionHead align="center" eyebrow="Procurement proof" title="What HSE & procurement teams value most" sub="The working relationship corporate clients stay for — structured quotes, consistent supply and accountable delivery." />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["Structured quote in 24 hours", "Our BOQ came back line-by-line with specs, sizes and VAT separated. It went straight into our LPO pack.", "Procurement Manager", "Construction • Nairobi"],
            ["One supplier for 400+ workers", "Helmets to boots in consistent sizes across three sites, with a single delivery schedule and invoice.", "HSE Lead", "Manufacturing • Thika"],
            ["Audit-ready documentation", "Delivery notes, VAT invoices and certification references matched our compliance file first time.", "Operations Officer", "Logistics • Mombasa Road"],
          ].map(([t, q, r, c]) => (
            <figure key={t as string} className="flex flex-col rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex gap-1 text-accent-500" aria-label="Rated 5 out of 5">{[0, 1, 2, 3, 4].map((s) => <Star key={s} size={15} className="fill-accent-500" />)}</div>
              <h3 className="mt-3 font-extrabold text-navy-950">{t}</h3>
              <blockquote className="mt-2 flex-1 text-[14px] leading-relaxed text-slate-600">“{q}”</blockquote>
              <figcaption className="mt-4 border-t border-slate-100 pt-3 text-[12.5px]">
                <span className="block font-extrabold text-navy-950">{r}</span>
                <span className="text-slate-500">{c}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/bulk-ppe" className="inline-flex items-center gap-2 rounded-xl bg-navy-950 px-6 py-3 text-sm font-bold text-white hover:bg-safety-600"><FileText size={16} /> Start a corporate quotation</Link>
          <Link href="/about" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-6 py-3 text-sm font-bold text-navy-950 hover:border-safety-600 hover:text-safety-600">How we work <ArrowRight size={15} /></Link>
        </div>
      </section>

      {/* ============ RESOURCES ============ */}
      <section className="mx-auto max-w-7xl px-4 py-14 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHead eyebrow="Safety resources" title="Guides your HSE team will actually use" sub="Standards explained, buying guides and industry checklists — each linked to the exact products mentioned." />
          <Link href="/resources" className="inline-flex items-center gap-1.5 text-sm font-bold text-safety-600 hover:text-accent-600">All articles <ArrowRight size={16} /></Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {homePosts.map((post) => (
            <Link key={post.slug} href={`/resources/${post.slug}`} className="group overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl">
              <div className="relative h-44 overflow-hidden">
                {post.image ? (
                  <Image src={post.image} alt={post.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-navy-950 via-navy-800 to-safety-700" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 to-transparent" />
                <span className="absolute bottom-3 left-4"><Badge tone="accent">{post.category}</Badge></span>
              </div>
              <div className="p-5">
                <h3 className="text-[16px] font-extrabold leading-snug text-navy-950 group-hover:text-safety-600">{post.title}</h3>
                <p className="mt-1.5 line-clamp-2 text-sm text-slate-600">{post.excerpt}</p>
                <p className="mt-3 text-xs font-semibold text-slate-400">{post.author} • {post.date} • {post.readMins} min read</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ CORPORATE CTA + CONTACT ============ */}
      <section className="bg-navy-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
          <div>
            <SectionHead dark eyebrow="Corporate accounts" title="A supply partner your auditors will like" sub="Framework pricing, credit-approved LPO terms, saved PPE schedules per site, VAT invoices and a named account contact." />
            <ul className="mt-5 space-y-2 text-sm text-slate-300">
              {["LPO & 30-day terms for approved accounts", "Framework rates locked for repeat orders", "Size schedules, delivery notes & VAT invoices"].map((t) => (
                <li key={t} className="flex items-center gap-2"><CheckCircle2 size={16} className="shrink-0 text-emerald-400" /> {t}</li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/register?type=company" className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-6 py-3 text-sm font-extrabold uppercase text-navy-950 hover:bg-white"><Building2 size={17} /> Open corporate account</Link>
              <Link href="/bulk-ppe" className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-6 py-3 text-sm font-bold text-white hover:border-accent-500 hover:text-accent-500"><FileText size={16} /> Request quotation</Link>
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.05] p-6 backdrop-blur">
            <h3 className="font-extrabold">Corporate procurement desk</h3>
            <p className="mt-1 text-[13px] text-slate-400">Mon–Sat, 8:00am–6:00pm EAT • Response within one business day</p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p className="flex items-center gap-2.5"><Phone size={17} className="shrink-0 text-accent-500" /> 0729 396 174 (Mon–Sat, 8am–6pm EAT)</p>
              <p className="flex items-center gap-2.5"><Truck size={17} className="shrink-0 text-accent-500" /> Nairobi same-day delivery • Upcountry 24–72h dispatch</p>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-navy-950 hover:bg-accent-100">Contact page <ArrowRight size={15} /></Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
