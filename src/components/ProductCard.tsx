"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Heart, ShieldCheck, ShoppingCart } from "lucide-react";
import { kes } from "@/lib/format";
import { productEnquiry } from "@/lib/whatsapp";
import { useStore } from "@/lib/store";
import type { CatalogProduct } from "@/lib/catalog";
import { categoryName } from "@/lib/catalog";
import { ProductVisual } from "./ProductVisual";
import { Badge, WhatsAppIcon } from "./ui";
import { cn } from "@/lib/utils";

export function ProductCard({ p, waNumber, compact }: { p: CatalogProduct; waNumber?: string; compact?: boolean }) {
  const { add, wishlist, toggleWish } = useStore();
  const [added, setAdded] = useState(false);
  const wished = wishlist.includes(p.slug);
  const discount = p.compareAt ? Math.round((1 - p.price / p.compareAt) * 100) : 0;

  const doAdd = () => {
    add({ slug: p.slug, name: p.name, sku: p.sku, price: p.price }, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:-translate-y-1 hover:border-safety-600/40 hover:shadow-[0_16px_40px_-16px_rgba(1,25,81,0.35)]">
      <div className="relative">
        <Link href={`/product/${p.slug}`} aria-label={p.name}>
          <ProductVisual category={p.category} name={p.name} sku={p.sku} image={p.image} fit="contain" className="aspect-[4/3] w-full transition-transform duration-300 group-hover:scale-[1.03]" />
        </Link>
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
          {discount > 0 && <Badge tone="accent">-{discount}%</Badge>}
          {p.isNew && <Badge tone="green">New</Badge>}
          {p.stock <= 0 && <Badge tone="red">Out of stock</Badge>}
          {p.stock > 0 && p.stock < 15 && <Badge tone="red">Low stock</Badge>}
        </div>
        <div className="absolute right-2.5 top-2.5 flex flex-col gap-1.5">
          <button onClick={() => toggleWish(p.slug)} aria-label="Add to wishlist"
            className={cn("flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-sm transition hover:scale-110", wished ? "text-red-500" : "text-slate-500 hover:text-red-500")}>
            <Heart size={17} fill={wished ? "currentColor" : "none"} />
          </button>
          <Link href={`/product/${p.slug}`} aria-label="Quick view"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-500 shadow-sm transition hover:scale-110 hover:text-safety-600">
            <Eye size={17} />
          </Link>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {!compact && (
          <p className="text-[11px] font-bold uppercase tracking-wider text-safety-600">{categoryName(p.category)} • {p.brand}</p>
        )}
        <Link href={`/product/${p.slug}`} className="line-clamp-2 min-h-[2.6em] text-[15px] font-bold leading-snug text-navy-950 hover:text-safety-600">
          {p.name}
        </Link>
        {!compact && <p className="line-clamp-1 text-xs text-slate-500">{p.short}</p>}
        {!compact && p.certifications.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {p.certifications.slice(0, 2).map((c) => (
              <span key={c} className="inline-flex items-center gap-1 rounded-md bg-safety-50 px-1.5 py-0.5 text-[10.5px] font-bold text-safety-700 ring-1 ring-safety-600/20">
                <ShieldCheck size={11} /> {c}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-extrabold text-navy-950">{kes(p.price)}</span>
            {p.compareAt && <span className="text-[13px] text-slate-400 line-through">{kes(p.compareAt)}</span>}
          </div>
          {!compact && (
            <p className="text-[11px] text-slate-500">{p.vatInclusive ? "VAT inclusive" : "Excl. VAT"} • {p.stock > 0 ? <span className="font-semibold text-emerald-600">In stock</span> : <span className="font-semibold text-red-500">Out of stock</span>}</p>
          )}
          <div className="mt-2.5 grid grid-cols-1 gap-2">
            <button onClick={doAdd} disabled={p.stock <= 0}
              className={cn("inline-flex h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-2 text-[13px] font-bold transition active:scale-95",
                added ? "bg-emerald-600 text-white" : "bg-navy-950 text-white hover:bg-safety-600")}>
              <ShoppingCart size={15} className="shrink-0" /> {added ? "Added!" : "Add to Cart"}
            </button>
            <a href={productEnquiry({ name: p.name, sku: p.sku, price: p.price })} target="_blank" rel="noopener"
              className="inline-flex h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-[#25D366] px-2 text-[13px] font-bold text-white ring-1 ring-[#25D366] transition hover:bg-[#25D366]/10 hover:text-[#128C4B] active:scale-95">
              <WhatsAppIcon size={15} /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
