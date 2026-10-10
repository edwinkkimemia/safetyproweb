"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Heart, Menu, Phone, Search, ShoppingCart, User, X, FileText } from "lucide-react";
import { useStore } from "@/lib/store";
import { CATEGORIES } from "@/lib/catalog";
import { kes } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ProductVisual } from "./ProductVisual";

// Company pages — live in the mobile drawer + footer (desktop nav is categories only).
const COMPANY_LINKS = [
  { href: "/packages", label: "PPE Kits" },
  { href: "/industries", label: "Industries" },
  { href: "/bulk-ppe", label: "Bulk Orders" },
  { href: "/training", label: "Safety Training" },
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

type SuggestItem = { name: string; slug: string; price: number; category: string; image?: string };

export function Header() {
  const { count, wishlist } = useStore();
  const [open, setOpen] = useState(false);
  const [mSearch, setMSearch] = useState(false);
  const [q, setQ] = useState("");
  const [suggest, setSuggest] = useState<SuggestItem[]>([]);
  const [sTotal, setSTotal] = useState(0);
  const [sLoading, setSLoading] = useState(false);
  const [sOpen, setSOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const reqId = useRef(0);

  const handleQ = (v: string) => {
    setQ(v);
    setSOpen(true);
    if (v.trim().length < 2) {
      reqId.current += 1;
      setSuggest([]); setSTotal(0); setSLoading(false);
    } else {
      setSLoading(true);
    }
  };

  // Live suggestions — debounced, results appear while typing (min 2 chars).
  // All state updates happen in event/async callbacks, never sync in the effect.
  useEffect(() => {
    const needle = q.trim();
    if (needle.length < 2) return;
    const id = ++reqId.current;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(needle)}`);
        if (id !== reqId.current) return;
        const data = await res.json();
        setSuggest((data.results ?? []).slice(0, 6));
        setSTotal(data.count ?? 0);
      } catch {
        if (id === reqId.current) { setSuggest([]); setSTotal(0); }
      } finally {
        if (id === reqId.current) setSLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  // Close suggestions on navigation (state adjusted during render — no effect).
  const [navPath, setNavPath] = useState(pathname);
  if (navPath !== pathname) {
    setNavPath(pathname);
    setSOpen(false);
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSOpen(false);
    setMSearch(false);
    router.push(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : "/shop");
    setOpen(false);
  };

  const showPanel = sOpen && q.trim().length >= 2;

  const suggestPanel = showPanel && (
    <div
      className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
      onMouseDown={(e) => e.preventDefault()}
    >
      {sLoading && suggest.length === 0 ? (
        <p className="px-4 py-3.5 text-sm text-slate-500">Searching…</p>
      ) : suggest.length === 0 ? (
        <p className="px-4 py-3.5 text-sm text-slate-500">
          No instant matches — press Search for full results.
        </p>
      ) : (
        <>
          <ul className="max-h-[320px] divide-y divide-slate-100 overflow-y-auto">
            {suggest.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/product/${p.slug}`}
                  onClick={() => setSOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-mist"
                >
                  <ProductVisual category={p.category} name={p.name} image={p.image} fit="contain" iconSize={18} className="h-11 w-11 shrink-0 rounded-lg border border-slate-100" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-bold text-navy-950">{p.name}</span>
                    <span className="block text-xs font-extrabold text-safety-600">{kes(p.price)}</span>
                  </span>
                  <ArrowRight size={15} className="shrink-0 text-slate-300" />
                </Link>
              </li>
            ))}
          </ul>
          <button
            onClick={submit}
            className="flex w-full items-center justify-center gap-1.5 border-t border-slate-100 bg-mist px-4 py-2.5 text-[13px] font-bold text-navy-950 transition hover:bg-safety-50 hover:text-safety-600"
          >
            See all {sTotal > 0 ? `${sTotal} ` : ""}results for “{q.trim()}” <ArrowRight size={14} />
          </button>
        </>
      )}
    </div>
  );

  return (
    <>
    {/* utility bar — static, scrolls away naturally so the sticky header below never changes height (no flicker) */}
    <div className="bg-navy-950 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-1.5 text-[11.5px] sm:px-6 sm:text-xs lg:px-8">
        <p className="truncate font-medium tracking-wide">
          <span className="font-bold text-accent-500">CORPORATE SUPPLY</span>
          <span className="mx-1.5 text-white/30">|</span> LPO Accepted
          <span className="mx-1.5 text-white/30">|</span> VAT Invoices
          <span className="mx-1.5 hidden text-white/30 sm:inline">|</span>
          <span className="hidden sm:inline">24hr Quotation SLA</span>
        </p>
        <div className="hidden shrink-0 items-center gap-4 sm:flex">
          <a href="mailto:sales@safetypro.co.ke" className="font-semibold text-slate-300 hover:text-accent-500">sales@safetypro.co.ke</a>
          <a href="tel:+254729396174" className="flex items-center gap-1.5 font-bold text-accent-100 hover:text-accent-500">
            <Phone size={13} /> 0729 396 174
          </a>
        </div>
      </div>
    </div>
    <header className="sticky top-0 z-50">
      {/* main bar */}
      <div className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:gap-4 sm:px-6 lg:gap-8 lg:px-8 lg:py-3">
          <button className="rounded-xl p-2 text-navy-950 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
          <Link href="/" className="group flex shrink-0 items-center gap-3" aria-label="SAFETYPRO AFRICA — home">
            <Image src="/logo/logo.png" alt="SAFETYPRO AFRICA" width={480} height={240} priority className="h-14 w-auto sm:h-16 lg:h-[72px]" />
          </Link>

          <form onSubmit={submit} className="mx-auto hidden max-w-2xl flex-1 items-center md:flex" role="search">
            <div className="relative w-full">
              <Search size={17} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={(e) => handleQ(e.target.value)} onFocus={() => setSOpen(true)} onBlur={() => setSOpen(false)}
                onKeyDown={(e) => { if (e.key === "Escape") setSOpen(false); }}
                type="search" aria-label="Search products" autoComplete="off" enterKeyHint="search"
                placeholder="Search helmets, EN397, cut resistant gloves, oil & gas…"
                className="h-12 w-full rounded-lg border border-slate-200 bg-mist pl-11 pr-28 text-sm shadow-sm outline-none transition focus:border-safety-600 focus:bg-white focus:ring-2 focus:ring-safety-100" />
              <button type="submit" className="absolute right-1.5 top-1/2 h-9 -translate-y-1/2 rounded-xl bg-navy-950 px-5 text-[13px] font-bold text-white transition hover:bg-safety-600">Search</button>
              {suggestPanel}
            </div>
          </form>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setMSearch(!mSearch)} aria-expanded={mSearch} aria-label={mSearch ? "Close search" : "Open search"}
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-navy-950 shadow-sm transition hover:border-safety-600/40 hover:bg-safety-50 hover:text-safety-600 md:hidden"
            >
              {mSearch ? <X size={20} /> : <Search size={20} />}
            </button>
            <Link href="/account" title="Account" aria-label="Account" className="hidden h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-navy-950 shadow-sm transition hover:border-safety-600/40 hover:bg-safety-50 hover:text-safety-600 sm:flex">
              <User size={20} />
            </Link>
            <Link href="/wishlist" title="Wishlist" aria-label="Wishlist" className="relative hidden h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-navy-950 shadow-sm transition hover:border-safety-600/40 hover:bg-safety-50 hover:text-safety-600 sm:flex">
              <Heart size={20} />
              {wishlist.length > 0 && <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-extrabold text-navy-950 ring-2 ring-white">{wishlist.length}</span>}
            </Link>
            <Link href="/cart" title="Cart" aria-label={`Cart${count > 0 ? `, ${count} item${count === 1 ? "" : "s"}` : ""}`} className="relative flex h-11 w-11 items-center justify-center rounded-lg bg-navy-950 text-white shadow-md transition hover:bg-safety-600">
              <ShoppingCart size={20} />
              {count > 0 && <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-extrabold text-navy-950 ring-2 ring-white">{count}</span>}
            </Link>
          </div>
        </div>
      </div>

      {/* mobile search — toggled by the search icon */}
      {mSearch && (
        <div className="border-b border-slate-200 bg-white px-4 pb-2.5 pt-1 sm:px-6 md:hidden">
          <form onSubmit={submit} className="relative" role="search">
            <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input autoFocus value={q} onChange={(e) => handleQ(e.target.value)} onFocus={() => setSOpen(true)} onBlur={() => setSOpen(false)}
              onKeyDown={(e) => { if (e.key === "Escape") { setSOpen(false); setMSearch(false); } }}
              type="search" aria-label="Search products" autoComplete="off" enterKeyHint="search"
              placeholder="Search PPE, SKU, EN397…"
              className="h-10 w-full rounded-xl border border-slate-300 bg-mist pl-9 pr-3 text-sm outline-none focus:border-safety-600" />
            {suggestPanel}
          </form>
        </div>
      )}
    </header>

      {/* mobile drawer — outside <header> so the hide-on-scroll transform never traps it */}
      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-navy-950/60" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-navy-950 px-4 py-4 text-white">
              <span className="flex items-center gap-2">
                <Image src="/logo/logo.png" alt="SAFETYPRO AFRICA" width={220} height={110} className="h-11 w-auto rounded bg-white px-1.5 py-0.5" />
              </span>
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="rounded-lg p-1.5 hover:bg-white/10"><X size={20} /></button>
            </div>
            <nav className="nice-scroll flex-1 overflow-y-auto p-3">
              <p className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">Shop by category</p>
              <Link href="/shop" onClick={() => setOpen(false)}
                className={cn("block rounded-xl px-3 py-3 text-[15px] font-semibold text-navy-950 hover:bg-mist", pathname === "/shop" && "bg-safety-50 text-safety-600")}>
                Shop All
              </Link>
              {CATEGORIES.map((c) => (
                <Link key={c.slug} href={`/shop/${c.slug}`} onClick={() => setOpen(false)}
                  className={cn("block rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-mist", isActive(pathname, `/shop/${c.slug}`) && "bg-safety-50 text-safety-600")}>{c.name}</Link>
              ))}
              <p className="px-3 pb-1 pt-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Company</p>
              {COMPANY_LINKS.map((n) => (
                <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
                  className={cn("block rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-mist", isActive(pathname, n.href) && "bg-safety-50 text-safety-600")}>
                  {n.label}
                </Link>
              ))}
              <p className="px-3 pb-1 pt-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">My account</p>
              {[
                { href: "/account", label: "Account & orders" },
                { href: "/wishlist", label: `Wishlist${wishlist.length > 0 ? ` (${wishlist.length})` : ""}` },
                { href: "/cart", label: `Cart${count > 0 ? ` (${count})` : ""}` },
              ].map((n) => (
                <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
                  className={cn("block rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-mist", pathname === n.href && "bg-safety-50 text-safety-600")}>
                  {n.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-slate-200 p-4">
              <Link href="/bulk-ppe" onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-4 py-3 text-sm font-extrabold uppercase text-navy-950">
                <FileText size={16} /> Request a Quote
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
