"use client";

import Link from "next/link";
import { ArrowRight, FileText, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { kes, vatAmount } from "@/lib/format";
import { ProductVisual } from "@/components/ProductVisual";
import { findProduct, PRODUCT_IMAGES, productImages } from "@/lib/catalog";

export default function CartPage() {
  const { lines, setQty, remove, subtotal, clear } = useStore();
  const vat = vatAmount(subtotal);
  const delivery = subtotal >= 20000 || subtotal === 0 ? 0 : 500;
  const total = subtotal + delivery;

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-mist text-slate-400"><ShoppingCart size={28} /></span>
        <h1 className="mt-4 text-2xl font-extrabold text-navy-950">Your cart is empty</h1>
        <p className="mt-2 text-slate-500">Browse our PPE range or request a corporate quotation for bulk supply.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="rounded-xl bg-navy-950 px-6 py-3 text-sm font-bold text-white hover:bg-safety-600">Continue shopping</Link>
          <Link href="/bulk-ppe" className="rounded-xl bg-accent-500 px-6 py-3 text-sm font-extrabold text-navy-950 hover:bg-accent-600 hover:text-white">Request quote</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:py-12">
      <h1 className="text-3xl font-extrabold tracking-tight text-navy-950">Shopping cart</h1>
      <p className="mt-1 text-sm text-slate-500">{lines.length} line{lines.length > 1 ? "s" : ""} • VAT-inclusive pricing</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {lines.map((l) => {
            const found = findProduct(l.slug);
            const cat = found?.category ?? "shield";
            const img = PRODUCT_IMAGES[l.slug] ?? found?.image ?? productImages({ slug: l.slug })[0];
            return (
              <div key={`${l.slug}-${l.size}-${l.colour}`} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-3.5">
                <ProductVisual category={cat} name={l.name} sku={l.sku} image={img} className="h-24 w-24 shrink-0 rounded-xl" iconSize={30} />
                <div className="min-w-0 flex-1">
                  <Link href={`/product/${l.slug}`} className="line-clamp-1 font-bold text-navy-950 hover:text-safety-600">{l.name}</Link>
                  <p className="mt-0.5 font-mono text-xs text-slate-400">{l.sku}{l.size ? ` • ${l.size}` : ""}{l.colour ? ` • ${l.colour}` : ""}</p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center rounded-lg border border-slate-300">
                      <button onClick={() => setQty(l.slug, l.qty - 1, l.size, l.colour)} className="p-2 text-slate-500" aria-label="Decrease"><Minus size={14} /></button>
                      <span className="w-8 text-center text-sm font-extrabold">{l.qty}</span>
                      <button onClick={() => setQty(l.slug, l.qty + 1, l.size, l.colour)} className="p-2 text-slate-500" aria-label="Increase"><Plus size={14} /></button>
                    </div>
                    <p className="text-[15px] font-extrabold text-navy-950">{kes(l.price * l.qty)} <span className="text-xs font-medium text-slate-400">({kes(l.price)} each)</span></p>
                  </div>
                </div>
                <button onClick={() => remove(l.slug, l.size, l.colour)} className="self-start rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500" aria-label="Remove item"><Trash2 size={17} /></button>
              </div>
            );
          })}
          <button onClick={clear} className="text-[13px] font-bold text-slate-400 hover:text-red-500">Clear cart</button>
        </div>

        <aside className="h-fit rounded-3xl bg-navy-950 p-6 text-white lg:sticky lg:top-40">
          <h2 className="font-extrabold">Order summary</h2>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between text-slate-300"><dt>Subtotal (VAT incl.)</dt><dd className="font-bold text-white">{kes(subtotal)}</dd></div>
            <div className="flex justify-between text-slate-300"><dt>VAT (16%) included</dt><dd>{kes(vat)}</dd></div>
            <div className="flex justify-between text-slate-300"><dt>Delivery</dt><dd className="font-bold text-white">{delivery === 0 ? "Calculated at checkout" : kes(delivery)}</dd></div>
            <div className="flex justify-between border-t border-white/15 pt-3 text-base"><dt className="font-extrabold">Total</dt><dd className="font-extrabold text-accent-500">{kes(total)}</dd></div>
          </dl>
          <Link href="/checkout" className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-accent-500 py-3.5 text-sm font-extrabold uppercase text-navy-950 hover:bg-white">Checkout <ArrowRight size={16} /></Link>
          <Link href="/bulk-ppe" className="mt-2.5 flex items-center justify-center gap-2 rounded-xl border border-white/25 py-3 text-sm font-bold text-white hover:border-accent-500 hover:text-accent-500"><FileText size={15} /> Request quote instead</Link>
          <Link href="/shop" className="mt-2.5 block text-center text-[13px] font-semibold text-slate-400 hover:text-white">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}
