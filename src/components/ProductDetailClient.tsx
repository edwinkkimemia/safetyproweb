"use client";

import { useState } from "react";
import {
  Building2, FileText, Heart, Minus, Plus, ReceiptText,
  ShieldCheck, ShoppingCart, Star, Truck,
} from "lucide-react";
import { kes } from "@/lib/format";
import { productEnquiry } from "@/lib/whatsapp";
import { useStore } from "@/lib/store";
import { ProductVisual } from "./ProductVisual";
import { Badge, WhatsAppIcon } from "./ui";
import type { CatalogProduct } from "@/lib/catalog";
import { categoryName, productImages } from "@/lib/catalog";
import { cn } from "@/lib/utils";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`Rated ${rating} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          size={15}
          className={i < Math.round(rating) ? "fill-accent-500 text-accent-500" : "fill-slate-200 text-slate-200"}
        />
      ))}
    </span>
  );
}

export function ProductDetailClient({ p, waNumber }: { p: CatalogProduct; waNumber: string }) {
  void waNumber;
  const { add, wishlist, toggleWish } = useStore();
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState(p.sizes[0]);
  const [colour, setColour] = useState(p.colours[0]);
  const [added, setAdded] = useState(false);
  const wished = wishlist.includes(p.slug);
  const gallery = productImages(p);
  const [active, setActive] = useState(0);
  const activeSrc = gallery[active] ?? p.image;
  const inStock = p.stock > 0;
  const lowStock = inStock && p.stock < 15;

  const doAdd = () => {
    add({ slug: p.slug, name: p.name, sku: p.sku, price: p.price, size, colour }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-10">
      {/* ============ LEFT — gallery (sticky on desktop) ============ */}
      <div className="lg:sticky lg:top-32">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <ProductVisual
            category={p.category} name={p.name} sku={p.sku} image={activeSrc}
            fit="contain" iconSize={96} eager
            className="h-[300px] w-full sm:h-[400px] lg:h-[440px]"
          />
        </div>
        {gallery.length > 1 && (
          <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3">
            <p className="mb-2 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
              Product photos ({gallery.length})
            </p>
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {gallery.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setActive(i)}
                  aria-label={`View photo ${i + 1} of ${gallery.length}`}
                  aria-pressed={i === active}
                  className={cn(
                    "relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition",
                    i === active ? "border-accent-500 ring-2 ring-accent-500/30" : "border-slate-200 hover:border-slate-400"
                  )}
                >
                  <ProductVisual category={p.category} name={p.name} sku={p.sku} image={src} fit="contain" className="h-full w-full" iconSize={24} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ============ RIGHT — buy panel ============ */}
      <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-widest text-safety-600">
            {categoryName(p.category)} • {p.brand}
          </p>
          <p className="font-mono text-xs text-slate-400">SKU: {p.sku}</p>
        </div>

        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-navy-950 text-balance sm:text-3xl">
          {p.name}
        </h1>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <Stars rating={p.rating} />
          <span className="text-[13px] font-bold text-navy-950">{p.rating.toFixed(1)}</span>
          <span className="text-[13px] text-slate-500">({p.reviews} reviews)</span>
          <span className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide",
            !inStock ? "bg-red-50 text-red-600" : lowStock ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
          )}>
            <span className={cn("h-1.5 w-1.5 rounded-full", !inStock ? "bg-red-500" : lowStock ? "bg-amber-500" : "bg-emerald-500")} />
            {!inStock ? "Out of stock" : lowStock ? `Only ${p.stock} left` : "In stock"}
          </span>
        </div>

        {/* price */}
        <div className="mt-4 rounded-xl bg-mist p-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-3xl font-extrabold tracking-tight text-navy-950">{kes(p.price)}</p>
            {p.compareAt && <p className="text-lg text-slate-400 line-through">{kes(p.compareAt)}</p>}
            {p.compareAt && <Badge tone="accent">Save {kes(p.compareAt - p.price)}</Badge>}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {p.vatInclusive ? "VAT included" : "Excluding VAT"} • VAT invoice on every order
          </p>
        </div>

        {p.short ? <p className="mt-4 text-[15px] leading-relaxed text-slate-600">{p.short}</p> : null}

        {/* options */}
        {p.sizes.length > 1 && (
          <div className="mt-5">
            <p className="mb-2 text-[13px] font-bold text-navy-950">
              Size: <span className="font-medium text-slate-500">{size}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {p.sizes.map((s) => (
                <button
                  key={s} onClick={() => setSize(s)} aria-pressed={size === s}
                  className={cn(
                    "min-h-[40px] min-w-[48px] rounded-xl border px-3 text-sm font-bold transition",
                    size === s ? "border-navy-950 bg-navy-950 text-white" : "border-slate-300 bg-white text-slate-600 hover:border-safety-600"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {p.colours.length > 1 && (
          <div className="mt-4">
            <p className="mb-2 text-[13px] font-bold text-navy-950">
              Colour: <span className="font-medium text-slate-500">{colour}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {p.colours.map((c) => (
                <button
                  key={c} onClick={() => setColour(c)} aria-pressed={colour === c}
                  className={cn(
                    "min-h-[40px] rounded-xl border px-3.5 text-sm font-bold transition",
                    colour === c ? "border-navy-950 bg-navy-950 text-white" : "border-slate-300 bg-white text-slate-600 hover:border-safety-600"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* qty + cart + wishlist */}
        <div className="mt-6 flex items-center gap-2.5">
          <div className="flex shrink-0 items-center rounded-xl border border-slate-300">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 text-slate-500 transition hover:text-navy-950" aria-label="Decrease quantity"><Minus size={16} /></button>
            <span className="w-8 text-center font-extrabold text-navy-950 sm:w-10" aria-live="polite">{qty}</span>
            <button onClick={() => setQty(Math.min(999, qty + 1))} className="p-3 text-slate-500 transition hover:text-navy-950" aria-label="Increase quantity"><Plus size={16} /></button>
          </div>
          <button
            onClick={doAdd} disabled={!inStock}
            className={cn(
              "inline-flex h-12 min-w-0 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 text-[13px] font-extrabold uppercase tracking-wide text-white transition active:scale-[0.98] sm:text-sm",
              added ? "bg-emerald-600" : "bg-navy-950 hover:bg-safety-600"
            )}
          >
            <ShoppingCart size={17} className="shrink-0" /> {added ? "Added!" : "Add to cart"}
          </button>
          <button
            onClick={() => toggleWish(p.slug)} aria-label="Toggle wishlist" aria-pressed={wished}
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition",
              wished ? "border-red-200 bg-red-50 text-red-500" : "border-slate-300 text-slate-500 hover:border-red-300 hover:text-red-500"
            )}
          >
            <Heart size={19} fill={wished ? "currentColor" : "none"} />
          </button>
        </div>

        {/* quote + whatsapp */}
        <div className="mt-2.5 grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2">
          <a
            href={`/bulk-ppe?product=${p.slug}&qty=${qty}`}
            className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-accent-500 px-3 text-[13px] font-extrabold uppercase tracking-wide text-navy-950 transition hover:bg-accent-600 hover:text-white sm:text-sm"
          >
            <FileText size={17} className="shrink-0" /> Request quote
          </a>
          <a
            href={productEnquiry({ name: p.name, sku: p.sku, price: p.price, qty })} target="_blank" rel="noopener"
            className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#25D366] px-3 text-[13px] font-extrabold uppercase tracking-wide text-white transition hover:brightness-95 sm:text-sm"
          >
            <WhatsAppIcon size={17} /> WhatsApp order
          </a>
        </div>

        {/* assurances */}
        <div className="mt-6 grid grid-cols-1 gap-2 rounded-xl bg-mist p-4 text-[13px] sm:grid-cols-2">
          {[
            { Icon: Truck, text: "Nairobi same-day delivery • upcountry 24–72h" },
            { Icon: ReceiptText, text: "VAT invoice on every order" },
            { Icon: Building2, text: "LPO & 30-day terms for approved accounts" },
            { Icon: ShieldCheck, text: "Certified stock, conformity docs on request" },
          ].map(({ Icon, text }) => (
            <p key={text} className="flex items-start gap-2 font-medium text-slate-600">
              <Icon size={16} className="mt-0.5 shrink-0 text-safety-600" /> {text}
            </p>
          ))}
        </div>

        {p.certifications.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-1.5">
              {p.certifications.map((c) => <Badge key={c} tone="blue">{c}</Badge>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
