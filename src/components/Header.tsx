"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Menu, Phone, Search, ShoppingCart, User, X, FileText } from "lucide-react";
import { useStore } from "@/lib/store";
import { CATEGORIES } from "@/lib/catalog";
import { cn } from "@/lib/utils";

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

export function Header() {
  const { count, wishlist } = useStore();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hidden, setHidden] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Hide only the top utility bar on scroll down, reveal on scroll up.
  // The main header (logo / search / cart) stays pinned.
  // Instant toggle (no height animation): animating max-height inside a
  // sticky backdrop-blur header repaints every frame and flickers on scroll.
  // 10px dead zone ignores scroll oscillation (mobile URL bar, trackpads).
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const dy = y - last;
        if (Math.abs(dy) < 10) {
          ticking = false;
          return;
        }
        if (y <= 40) {
          setHidden((prev) => (prev ? false : prev));
        } else if (dy > 0) {
          setHidden((prev) => (prev ? prev : true));
        } else {
          setHidden((prev) => (prev ? false : prev));
        }
        last = y;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : "/shop");
    setOpen(false);
  };

  return (
    <>
    <header className="sticky top-0 z-50">
      {/* utility bar — corporate assurance, collapses away on scroll down */}
      <div aria-hidden={hidden} className={cn("overflow-hidden bg-navy-950 text-white", hidden ? "max-h-0 opacity-0" : "max-h-10 opacity-100")}>
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
            <a href="tel:+254715135141" className="flex items-center gap-1.5 font-bold text-accent-100 hover:text-accent-500">
              <Phone size={13} /> 0715 135 141
            </a>
          </div>
        </div>
      </div>

      {/* main bar */}
      <div className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:gap-4 sm:px-6 lg:gap-8 lg:px-8 lg:py-3">
          <button className="rounded-xl p-2 text-navy-950 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
          <Link href="/" className="group flex shrink-0 items-center gap-3" aria-label="SAFETYPRO AFRICA — home">
            <Image src="/logo/logo.png" alt="SAFETYPRO AFRICA" width={480} height={240} priority className="h-14 w-auto sm:h-16 lg:h-[72px]" />
          </Link>

          <form onSubmit={submit} className="mx-auto hidden max-w-2xl flex-1 items-center md:flex">
            <div className="relative w-full">
              <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search helmets, EN397, cut resistant gloves, oil & gas…"
                className="h-12 w-full rounded-lg border border-slate-200 bg-mist pl-11 pr-28 text-sm shadow-sm outline-none transition focus:border-safety-600 focus:bg-white focus:ring-2 focus:ring-safety-100" />
              <button type="submit" className="absolute right-1.5 top-1/2 h-9 -translate-y-1/2 rounded-xl bg-navy-950 px-5 text-[13px] font-bold text-white transition hover:bg-safety-600">Search</button>
            </div>
          </form>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
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

      {/* mobile search */}
      <div className="border-b border-slate-200 bg-white px-4 pb-2.5 pt-1 sm:px-6 md:hidden">
        <form onSubmit={submit} className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search PPE, SKU, EN397…"
            className="h-10 w-full rounded-xl border border-slate-300 bg-mist pl-9 pr-3 text-sm outline-none focus:border-safety-600" />
        </form>
      </div>
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
