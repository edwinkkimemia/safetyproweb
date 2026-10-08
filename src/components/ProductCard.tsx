"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, ShieldCheck, ShoppingCart } from "lucide-react";
import { kes } from "@/lib/format";
import { productEnquiry } from "@/lib/whatsapp";
import { useStore } from "@/lib/store";
import type { CatalogProduct } from "@/lib/catalog";
import { ProductVisual } from "./ProductVisual";
import { WhatsAppIcon } from "./ui";
import { cn } from "@/lib/utils";

export function ProductCard({ p, waNumber, compact }: { p: CatalogProduct; waNumber?: string; compact?: boolean }) {
  const { add, wishlist, toggleWish } = useStore();
  const [added, setAdded] = useState(false);
  const wished = wishlist.includes(p.slug);

  const doAdd = () => {
    add({ slug: p.slug, name: p.name, sku: p.sku, price: p.price }, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:-translate-y-1 hover:border-safety-600/40 hover:shadow-[0_16px_40px_-16px_rgba(1,25,81,0.35)]">
      <div className="relative bg-white">
        <Link href={`/product/${p.slug}`} aria-label={p.name}>
          <ProductVisual category={p.category} name={p.name} sku={p.sku} image={p.image} fit="contain" className="aspect-square w-full" />
        </Link>
        <button onClick={() => toggleWish(p.slug)} aria-label="Add to wishlist"
          className={cn("absolute bottom-2.5 right-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-sm transition hover:scale-110", wished ? "text-red-500" : "text-slate-500 hover:text-red-500")}>
          <Heart size={16} fill={wished ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1 border-t border-slate-100 bg-white p-3">
        <Link href={`/product/${p.slug}`} title={p.name} className="truncate text-[13.5px] font-bold leading-snug text-navy-950 hover:text-safety-600">
          {p.name}
        </Link>
        {!compact && p.certifications.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {p.certifications.slice(0, 2).map((c) => (
              <span key={c} className="inline-flex items-center gap-1 rounded-md bg-safety-50 px-1.5 py-0.5 text-[10.5px] font-bold text-safety-700 ring-1 ring-safety-600/20">
                <ShieldCheck size={11} /> {c}
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-lg font-extrabold text-navy-950">{kes(p.price)}</span>
          {p.compareAt && <span className="text-[13px] text-slate-400 line-through">{kes(p.compareAt)}</span>}
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          <button onClick={doAdd} disabled={p.stock <= 0}
            className={cn("inline-flex h-9 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-2 text-xs font-bold transition active:scale-95",
              added ? "bg-emerald-600 text-white" : "bg-navy-950 text-white hover:bg-safety-600")}>
            <ShoppingCart size={14} className="shrink-0" /> {added ? "Added!" : p.stock <= 0 ? "Out of stock" : "Add to Cart"}
          </button>
          <a href={productEnquiry({ name: p.name, sku: p.sku, price: p.price })} target="_blank" rel="noopener" aria-label={`Order ${p.name} on WhatsApp`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#25D366] text-white transition hover:brightness-95 active:scale-95">
            <WhatsAppIcon size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}

/* DealCard — square image frame fits supplier photos edge-to-edge (no crop,
   no letterbox). Clean image, wishlist bottom-left, WhatsApp next to cart. */
export function DealCard({ p }: { p: CatalogProduct }) {
  const { add, wishlist, toggleWish } = useStore();
  const [added, setAdded] = useState(false);
  const wished = wishlist.includes(p.slug);

  const doAdd = () => {
    add({ slug: p.slug, name: p.name, sku: p.sku, price: p.price }, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-accent-500/60 bg-white transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_-16px_rgba(1,25,81,0.35)]">
      <div className="relative bg-white">
        <Link href={`/product/${p.slug}`} aria-label={p.name}>
          <ProductVisual category={p.category} name={p.name} sku={p.sku} image={p.image} fit="contain" className="aspect-square w-full" />
        </Link>
        <button onClick={() => toggleWish(p.slug)} aria-label="Add to wishlist"
          className={cn("absolute bottom-2.5 right-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-sm transition hover:scale-110", wished ? "text-red-500" : "text-slate-500 hover:text-red-500")}>
          <Heart size={16} fill={wished ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1 border-t border-dashed border-slate-200 bg-mist/60 p-3">
        <Link href={`/product/${p.slug}`} title={p.name} className="truncate text-[13.5px] font-bold leading-snug text-navy-950 hover:text-safety-600">
          {p.name}
        </Link>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-lg font-extrabold text-navy-950">{kes(p.price)}</span>
          {p.compareAt && <span className="text-[13px] text-slate-400 line-through">{kes(p.compareAt)}</span>}
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          <button onClick={doAdd} disabled={p.stock <= 0}
            className={cn("inline-flex h-9 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-2 text-xs font-bold transition active:scale-95",
              added ? "bg-emerald-600 text-white" : "bg-accent-500 text-navy-950 hover:bg-navy-950 hover:text-white")}>
            <ShoppingCart size={14} className="shrink-0" /> {added ? "Added!" : p.stock <= 0 ? "Out of stock" : "Add to Cart"}
          </button>
          <a href={productEnquiry({ name: p.name, sku: p.sku, price: p.price })} target="_blank" rel="noopener" aria-label={`Order ${p.name} on WhatsApp`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#25D366] text-white transition hover:brightness-95 active:scale-95">
            <WhatsAppIcon size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
