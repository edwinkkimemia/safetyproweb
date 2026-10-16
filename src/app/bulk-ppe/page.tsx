"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BadgeCheck, Building2, CheckCircle2, ClipboardList, FileText, FileUp, Mail, Phone, Plus, Trash2, Truck, type LucideIcon } from "lucide-react";
import { INDUSTRIES, COUNTIES, findProduct } from "@/lib/catalog";
import { Breadcrumbs, Field, inputCls } from "@/components/ui";

const ALLOWED = [
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function BulkForm() {
  const sp = useSearchParams();
  const preProduct = sp.get("product");
  const preQty = Number(sp.get("qty") ?? 1);
  const [items, setItems] = useState(
    preProduct && findProduct(preProduct) ? [{ name: findProduct(preProduct)!.name, quantity: preQty || 1 }] : [{ name: "", quantity: 10 }]
  );
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    companyName: "", contactPerson: "", email: "", phone: "", industry: "",
    deliveryLocation: "", deliveryDate: "", notes: "", employeeSizes: "", specs: "", brands: "",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const pickFile = (f: File | undefined) => {
    setFileError("");
    if (!f) { setFile(null); return; }
    if (!ALLOWED.includes(f.type) && !/\.(xlsx?|csv|pdf|docx?)$/i.test(f.name)) {
      setFileError("Only Excel, CSV, PDF or Word files are accepted.");
      return;
    }
    if (f.size > 8 * 1024 * 1024) { setFileError("Maximum file size is 8MB."); return; }
    setFile(f);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true); setError("");
    try {
      const res = await fetch("/api/quotations", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.filter((i) => i.name.trim()).map((i) => ({ name: i.name.trim(), quantity: i.quantity })),
          document: file ? { filename: file.name, mimeType: file.type || "application/octet-stream", size: file.size, url: "" } : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed.");
      setDone(data.quoteNo);
    } catch (err: any) { setError(err.message); }
    finally { setSending(false); }
  };

  if (done) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-10 text-center">
        <CheckCircle2 size={52} className="mx-auto text-emerald-600" />
        <h2 className="mt-3 text-2xl font-extrabold text-navy-950">Quotation request received</h2>
        <p className="mt-2 text-slate-600">Reference <strong className="font-mono text-navy-950">{done}</strong>. Our procurement team responds within one business day with a structured line-item quotation.</p>
        <a href="/shop" className="mt-6 inline-block rounded-xl bg-navy-950 px-6 py-3 text-sm font-bold text-white">Browse products meanwhile</a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company name *"><input required className={inputCls} value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="Acme Construction Ltd" /></Field>
        <Field label="Contact person *"><input required className={inputCls} value={form.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} placeholder="John Mwangi" /></Field>
        <Field label="Work email *"><input required type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="procurement@company.co.ke" /></Field>
        <Field label="Phone *"><input required className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="0729 396 174" /></Field>
        <Field label="Industry">
          <select className={inputCls} value={form.industry} onChange={(e) => set("industry", e.target.value)}>
            <option value="">Select industry…</option>
            {INDUSTRIES.map((i) => <option key={i.slug} value={i.name}>{i.name}</option>)}
          </select>
        </Field>
        <Field label="Delivery location">
          <select className={inputCls} value={form.deliveryLocation} onChange={(e) => set("deliveryLocation", e.target.value)}>
            <option value="">Select county…</option>
            {COUNTIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Required delivery date"><input type="date" className={inputCls} value={form.deliveryDate} onChange={(e) => set("deliveryDate", e.target.value)} /></Field>
        <Field label="Preferred brands"><input className={inputCls} value={form.brands} onChange={(e) => set("brands", e.target.value)} placeholder="3M, Honeywell, SafetyPro…" /></Field>
      </div>

      <div className="mt-6">
        <h3 className="font-extrabold text-navy-950">Products required</h3>
        <div className="mt-2 space-y-2">
          {items.map((it, i) => (
            <div key={i} className="flex gap-2">
              <input className={inputCls} value={it.name} onChange={(e) => setItems((p) => p.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder="e.g. S3 safety boots — 200 pairs" />
              <input type="number" min={1} className={`${inputCls} max-w-28`} value={it.quantity} onChange={(e) => setItems((p) => p.map((x, j) => j === i ? { ...x, quantity: Number(e.target.value) } : x))} aria-label="Quantity" />
              <button type="button" onClick={() => setItems((p) => p.filter((_, j) => j !== i))} className="rounded-xl border border-slate-200 px-3 text-slate-400 hover:text-red-500" aria-label="Remove line"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setItems((p) => [...p, { name: "", quantity: 10 }])}
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-safety-600 hover:text-accent-600"><Plus size={15} /> Add another product line</button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Employee sizes" hint="e.g. Boots 42×40, 43×60… Overall M×30, L×50…">
          <textarea rows={3} className={inputCls} value={form.employeeSizes} onChange={(e) => set("employeeSizes", e.target.value)} />
        </Field>
        <Field label="Required specifications" hint="e.g. EN397 helmets, S3 boots, Type 5/6 suits">
          <textarea rows={3} className={inputCls} value={form.specs} onChange={(e) => set("specs", e.target.value)} />
        </Field>
      </div>
      <div className="mt-4">
        <Field label="Additional notes"><textarea rows={3} className={inputCls} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Tender deadline, delivery schedule, invoicing requirements…" /></Field>
      </div>

      <div className="mt-6 rounded-lg border-2 border-dashed border-slate-300 bg-mist p-5">
        <p className="flex items-center gap-2 font-extrabold text-navy-950"><FileUp size={18} className="text-safety-600" /> Upload PPE list</p>
        <p className="mt-1 text-[13px] text-slate-500">Have a long PPE list? Upload it and our procurement team will prepare a quotation. Excel, CSV, PDF or Word — max 8MB.</p>
        <input type="file" accept=".xlsx,.xls,.csv,.pdf,.doc,.docx" onChange={(e) => pickFile(e.target.files?.[0])}
          className="mt-3 block w-full text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-navy-950 file:px-4 file:py-2.5 file:text-sm file:font-bold file:text-white hover:file:bg-safety-600" />
        {file && <p className="mt-2 text-[13px] font-semibold text-emerald-600">Attached: {file.name} ({(file.size / 1024).toFixed(0)} KB)</p>}
        {fileError && <p className="mt-2 text-[13px] font-semibold text-red-500">{fileError}</p>}
      </div>

      {error && <p className="mt-4 rounded-xl bg-red-50 p-3.5 text-sm font-semibold text-red-600 ring-1 ring-red-200">{error}</p>}
      <button disabled={sending} className="mt-6 w-full rounded-xl bg-accent-500 py-4 text-[15px] font-extrabold uppercase tracking-wide text-navy-950 transition hover:bg-navy-950 hover:text-white disabled:opacity-60">
        {sending ? "Sending request…" : "Request corporate quotation"}
      </button>
      <p className="mt-2 text-center text-xs text-slate-400">Saved to our procurement queue • Response within 1 business day</p>
    </form>
  );
}

export default function BulkPpePage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Bulk PPE & Corporate Procurement" }]} />
      {/* corporate hero */}
      <div className="border-b border-slate-200 bg-navy-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-accent-500 ring-1 ring-white/15">
            <Building2 size={14} /> Corporate procurement desk
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-extrabold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem]">Bulk PPE & Corporate Procurement</h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-300">One supplier for your entire workforce — volume pricing, LPO & 30-day terms for approved accounts, size schedules per employee, and KRA-compliant VAT invoices with every delivery.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {([
              ["24hr line-item quotes", "BOQs & tender schedules welcome", FileText],
              ["LPO & credit terms", "30-day terms for approved accounts", ClipboardList],
              ["Audit-ready docs", "VAT invoices + delivery notes", BadgeCheck],
              ["47-county delivery", "Nairobi pickup + tracked dispatch", Truck],
            ] as [string, string, LucideIcon][]).map(([t, d, Icon]) => (
              <div key={t} className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
                <Icon size={20} className="text-accent-500" />
                <p className="mt-2 text-sm font-extrabold text-white">{t}</p>
                <p className="mt-0.5 text-[12.5px] text-slate-400">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {/* 4-step process */}
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["01", "Send your list", "Paste items, upload Excel/CSV/PDF, or share your BOQ."],
          ["02", "Get quote in 24hrs", "Line-item pricing with specs, sizes & VAT separated."],
          ["03", "Approve & raise LPO", "M-Pesa, bank or 30-day LPO for approved accounts."],
          ["04", "Receive & reconcile", "Scheduled delivery with notes + VAT invoice."],
        ].map(([n, t, d]) => (
          <li key={n} className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-xs font-extrabold tracking-widest text-accent-600">{n}</p>
            <p className="mt-1 font-extrabold text-navy-950">{t}</p>
            <p className="mt-1 text-[13px] text-slate-600">{d}</p>
          </li>
        ))}
      </ol>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div>
      <h2 className="text-xl font-extrabold text-navy-950">Request your corporate quotation</h2>
      <p className="mt-1 text-sm text-slate-600">Complete the form — our procurement team responds within one business day.</p>
      <div className="mt-4">
        <Suspense fallback={<div className="rounded-xl border p-10 text-center text-slate-400">Loading form…</div>}>
          <BulkForm />
        </Suspense>
      </div>
      </div>
      <aside className="space-y-4 lg:sticky lg:top-40 lg:self-start">
        <div className="rounded-xl bg-navy-950 p-6 text-white">
          <h3 className="font-extrabold">Talk to procurement directly</h3>
          <div className="mt-4 space-y-3 text-sm">
            <p className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-accent-500"><Phone size={17} /></span><span><strong className="block text-white">+254 715 135 141</strong><span className="text-slate-400">Mon–Sat, 8am–6pm EAT</span></span></p>
            <p className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-accent-500"><Mail size={17} /></span><span><strong className="block text-white">sales@safetypro.co.ke</strong><span className="text-slate-400">BOQs, LPOs & tender docs</span></span></p>
          </div>
          <div className="mt-5 rounded-lg bg-white/[0.06] p-4 text-[13px] text-slate-300 ring-1 ring-white/10">
            <p className="font-extrabold text-white">What happens next?</p>
            <ul className="mt-2 space-y-1.5">
              {["Named account contact assigned", "Sizes & specs confirmed before payment", "Delivery schedule agreed per site"].map((t) => (
                <li key={t} className="flex gap-2"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-400" /> {t}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-mist p-6">
          <h3 className="font-extrabold text-navy-950">Framework & repeat orders</h3>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-600">Lock rates for 6–12 months, save site-specific PPE schedules, and reorder in one click with consistent invoicing.</p>
          <a href="/register?type=company" className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-navy-950 py-3 text-sm font-bold text-white hover:bg-safety-600"><Building2 size={16} /> Open corporate account</a>
        </div>
      </aside>
      </div>
      </div>
    </>
  );
}
