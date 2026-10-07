"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COUNTIES } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { kes, vatAmount } from "@/lib/format";
import { Field, inputCls } from "@/components/ui";

export default function CheckoutPage() {
  const { lines, subtotal, clear } = useStore();
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    customerName: "", company: "", email: "", phone: "",
    address: "", county: "Nairobi", town: "", notes: "", paymentMethod: "MPESA",
  });

  const vat = vatAmount(subtotal);
  const delivery = subtotal >= 20000 || subtotal === 0 ? 0 : 500;
  const total = subtotal + delivery;
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lines.length) { setError("Your cart is empty."); return; }
    setSending(true); setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: lines.map((l) => ({ slug: l.slug, name: l.name, sku: l.sku, price: l.price, qty: l.qty, size: l.size, colour: l.colour })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Order failed. Please try again.");
      clear();
      router.push(`/order-success?no=${data.orderNo}&total=${data.total}`);
    } catch (err: any) {
      setError(err.message);
    } finally { setSending(false); }
  };

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-extrabold text-navy-950">Nothing to check out yet</h1>
        <p className="mt-2 text-slate-500">Add some PPE to your cart first.</p>
        <a href="/shop" className="mt-6 inline-block rounded-xl bg-navy-950 px-6 py-3 text-sm font-bold text-white">Browse products</a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:py-12">
      <h1 className="text-3xl font-extrabold tracking-tight text-navy-950">Checkout</h1>
      <p className="mt-1 text-sm text-slate-500">M-Pesa • Bank transfer • Cash on delivery • LPO for approved corporate accounts</p>
      <form onSubmit={submit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="font-extrabold text-navy-950">1. Contact & delivery details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Full name *"><input required className={inputCls} value={form.customerName} onChange={(e) => set("customerName", e.target.value)} placeholder="Jane Wanjiku" /></Field>
              <Field label="Company (optional)"><input className={inputCls} value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Acme Construction Ltd" /></Field>
              <Field label="Email *"><input required type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@company.co.ke" /></Field>
              <Field label="Phone / M-Pesa number *"><input required className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="0715 135 141" /></Field>
              <Field label="Delivery address *"><input required className={inputCls} value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Plot, road, building" /></Field>
              <Field label="Town *"><input required className={inputCls} value={form.town} onChange={(e) => set("town", e.target.value)} placeholder="Nairobi" /></Field>
              <Field label="County *">
                <select className={inputCls} value={form.county} onChange={(e) => set("county", e.target.value)}>
                  {COUNTIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Delivery notes"><input className={inputCls} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Gate, contact person, hours" /></Field>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="font-extrabold text-navy-950">2. Payment method</h2>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {[
                ["MPESA", "M-Pesa", "Pay via Till/Paybill on confirmation"],
                ["BANK", "Bank transfer", "EFT to our KCB account"],
                ["COD", "Cash on delivery", "Nairobi orders, up to KES 50,000"],
                ["LPO", "LPO / Corporate terms", "Approved business accounts only"],
              ].map(([v, t, d]) => (
                <label key={v} className={`cursor-pointer rounded-2xl border-2 p-4 transition ${form.paymentMethod === v ? "border-safety-600 bg-safety-50" : "border-slate-200 hover:border-slate-300"}`}>
                  <input type="radio" name="pay" checked={form.paymentMethod === v} onChange={() => set("paymentMethod", v)} className="sr-only" />
                  <span className="block font-extrabold text-navy-950">{t}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">{d}</span>
                </label>
              ))}
            </div>
            {form.paymentMethod === "LPO" && (
              <p className="mt-3 rounded-xl bg-amber-50 p-3 text-[13px] text-amber-800 ring-1 ring-amber-200">
                LPO orders are reviewed by our sales team — credit is not automatic. We&apos;ll confirm terms within one business day.
              </p>
            )}
          </section>

          {error && <p className="rounded-xl bg-red-50 p-3.5 text-sm font-semibold text-red-600 ring-1 ring-red-200">{error}</p>}
        </div>

        <aside className="h-fit rounded-3xl bg-navy-950 p-6 text-white lg:sticky lg:top-40">
          <h2 className="font-extrabold">Order summary</h2>
          <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto text-[13px] nice-scroll">
            {lines.map((l) => (
              <li key={`${l.slug}-${l.size}-${l.colour}`} className="flex justify-between gap-2 text-slate-300">
                <span className="truncate">{l.qty} × {l.name}</span><span className="shrink-0 font-bold text-white">{kes(l.price * l.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-white/15 pt-4 text-sm">
            <div className="flex justify-between text-slate-300"><dt>Subtotal (VAT incl.)</dt><dd className="font-bold text-white">{kes(subtotal)}</dd></div>
            <div className="flex justify-between text-slate-300"><dt>VAT included</dt><dd>{kes(vat)}</dd></div>
            <div className="flex justify-between text-slate-300"><dt>Delivery</dt><dd className="font-bold text-white">{delivery === 0 ? "FREE*" : kes(delivery)}</dd></div>
            <div className="flex justify-between pt-1 text-lg"><dt className="font-extrabold">Total</dt><dd className="font-extrabold text-accent-500">{kes(total)}</dd></div>
          </dl>
          <p className="mt-1 text-[11px] text-slate-400">*Free delivery guidance above KES 20,000 within Nairobi.</p>
          <button disabled={sending} className="mt-4 w-full rounded-xl bg-accent-500 py-3.5 text-sm font-extrabold uppercase text-navy-950 transition hover:bg-white disabled:opacity-60">
            {sending ? "Placing order…" : `Place order • ${kes(total)}`}
          </button>
        </aside>
      </form>
    </div>
  );
}
