"use client";

import { useState } from "react";
import { FileText, Heart, Minus, Plus, ShieldCheck, ShoppingCart, Truck } from "lucide-react";
import { kes } from "@/lib/format";
import { productEnquiry, waLink } from "@/lib/whatsapp";
import { useStore } from "@/lib/store";
import { ProductVisual } from "./ProductVisual";
import { Badge, WhatsAppIcon } from "./ui";
import type { CatalogProduct } from "@/lib/catalog";
import { categoryName, productImages } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function ProductDetailClient({ p, waNumber }: { p: CatalogProduct; waNumber: string }) {
  const { add, wishlist, toggleWish } = useStore();
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState(p.sizes[0]);
  const [colour, setColour] = useState(p.colours[0]);
  const [added, setAdded] = useState(false);
  const wished = wishlist.includes(p.slug);
  const gallery = productImages(p);
  const [active, setActive] = useState(0);
  const activeSrc = gallery[active] ?? p.image;

  const doAdd = () => {
    add({ slug: p.slug, name: p.name, sku: p.sku, price: p.price, size, colour }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <div className="overflow-hidden rounded-3xl border border-slate-200">
          <ProductVisual category={p.category} name={p.name} sku={p.sku} image={activeSrc} fit="contain" className="aspect-square max-h-[calc(100svh-200px)] w-full" iconSize={96} eager />
        </div>
        {gallery.length > 1 && (
          <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
            {gallery.map((src, i) => (
              <button
                key={src + i}
                onClick={() => setActive(i)}
                aria-label={`View image ${i + 1}`}
                className={cn("relative h-20 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition", i === active ? "border-accent-500" : "border-slate-200 hover:border-slate-300")}
              >
                <ProductVisual category={p.category} name={p.name} sku={p.sku} image={src} fit="contain" className="h-full w-full" iconSize={24} />
              </button>
            ))}
          </div>
        )}
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-mist p-4 text-[13px] text-slate-600">
          <Truck size={18} className="shrink-0 text-safety-600" />
          Nairobi same-day pickup available • Upcountry dispatch 24–72h • Free delivery guidance above KES 20,000
        </div>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-safety-600">{categoryName(p.category)} • {p.brand}</p>
        <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-navy-950 sm:text-3xl">{p.name}</h1>

        <div className="mt-4 flex items-end gap-3">
          <p className="text-3xl font-extrabold text-navy-950">{kes(p.price)}</p>
          {p.compareAt && <p className="pb-1 text-lg text-slate-400 line-through">{kes(p.compareAt)}</p>}
          {p.compareAt && <Badge tone="accent">Save {kes(p.compareAt - p.price)}</Badge>}
        </div>

        {p.sizes.length > 1 && (
          <div className="mt-5">
            <p className="mb-2 text-[13px] font-bold text-navy-950">Size: <span className="font-medium text-slate-500">{size}</span></p>
            <div className="flex flex-wrap gap-2">
              {p.sizes.map((s) => (
                <button key={s} onClick={() => setSize(s)}
                  className={cn("min-h-[40px] min-w-[48px] rounded-xl border px-3 text-sm font-bold transition",
                    size === s ? "border-navy-950 bg-navy-950 text-white" : "border-slate-300 bg-white text-slate-600 hover:border-safety-600")}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {p.colours.length > 1 && (
          <div className="mt-4">
            <p className="mb-2 text-[13px] font-bold text-navy-950">Colour: <span className="font-medium text-slate-500">{colour}</span></p>
            <div className="flex flex-wrap gap-2">
              {p.colours.map((c) => (
                <button key={c} onClick={() => setColour(c)}
                  className={cn("min-h-[40px] rounded-xl border px-3.5 text-sm font-bold transition",
                    colour === c ? "border-navy-950 bg-navy-950 text-white" : "border-slate-300 bg-white text-slate-600 hover:border-safety-600")}>{c}</button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center gap-2.5">
          <div className="flex shrink-0 items-center rounded-xl border border-slate-300">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 text-slate-500 hover:text-navy-950" aria-label="Decrease quantity"><Minus size={16} /></button>
            <span className="w-8 text-center font-extrabold text-navy-950 sm:w-10">{qty}</span>
            <button onClick={() => setQty(Math.min(999, qty + 1))} className="p-3 text-slate-500 hover:text-navy-950" aria-label="Increase quantity"><Plus size={16} /></button>
          </div>
          <button onClick={doAdd} disabled={p.stock <= 0}
            className={cn("inline-flex h-12 min-w-0 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 text-[13px] font-extrabold uppercase tracking-wide text-white transition active:scale-[0.98] sm:flex-none sm:px-8 sm:text-sm",
              added ? "bg-emerald-600" : "bg-navy-950 hover:bg-safety-600")}>
            <ShoppingCart size={17} className="shrink-0" /> {added ? "Added!" : "Add to cart"}
          </button>
          <button onClick={() => toggleWish(p.slug)} aria-label="Toggle wishlist"
            className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition",
              wished ? "border-red-200 bg-red-50 text-red-500" : "border-slate-300 text-slate-500 hover:border-red-300 hover:text-red-500")}>
            <Heart size={19} fill={wished ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2">
          <a href={`/bulk-ppe?product=${p.slug}&qty=${qty}`}
            className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-accent-500 px-3 text-[13px] font-extrabold uppercase tracking-wide text-navy-950 transition hover:bg-accent-600 hover:text-white sm:text-sm">
            <FileText size={17} className="shrink-0" /> Request quote
          </a>
          <a href={productEnquiry({ name: p.name, sku: p.sku, price: p.price, qty })} target="_blank" rel="noopener"
            className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#25D366] px-3 text-[13px] font-extrabold uppercase tracking-wide text-white transition hover:brightness-95 sm:text-sm">
            <WhatsAppIcon size={17} /> WhatsApp order
          </a>
        </div>

        {p.certifications.length > 0 && (
          <div className="mt-5 rounded-2xl border border-safety-600/25 bg-safety-50 p-4">
            <p className="flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-widest text-safety-700"><ShieldCheck size={15} /> Certifications on file</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {p.certifications.map((c) => <Badge key={c} tone="blue">{c}</Badge>)}
            </div>
            <p className="mt-2 text-xs text-slate-500">Only certifications stored in our product database are shown. Conformity documents available on request.</p>
          </div>
        )}
      </div>
    </div>
  );
}
