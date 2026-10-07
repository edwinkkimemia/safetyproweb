"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Mail, MapPin, Phone } from "lucide-react";
import { waLink } from "@/lib/whatsapp";
import { Breadcrumbs, Field, WhatsAppIcon, inputCls } from "@/components/ui";

export default function ContactPage() {
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true); setError("");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Could not send message. Please try WhatsApp instead.");
      setDone(true);
    } catch (err: any) { setError(err.message); }
    finally { setSending(false); }
  };

  return (
    <>
      <Breadcrumbs items={[{ label: "Contact" }]} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">Talk to our safety team</h1>
      <p className="mt-2 max-w-2xl text-[15px] text-slate-600">Quotes, sizing help, delivery tracking and corporate accounts — call, WhatsApp or send the form.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <div className="rounded-3xl bg-navy-950 p-6 text-white">
            <h2 className="font-extrabold">Contact information</h2>
            <div className="mt-4 space-y-3.5 text-sm">
              <p className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-accent-500"><Phone size={17} /></span><span><strong className="block text-white">+254 715 135 141</strong><span className="text-slate-400">Sales & support line</span></span></p>
              <p className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-accent-500"><WhatsAppIcon size={17} /></span><span><strong className="block text-white">WhatsApp chat</strong><span className="text-slate-400">Fastest for product questions</span></span></p>
              <p className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-accent-500"><Mail size={17} /></span><span><strong className="block text-white">info@safetypro.co.ke</strong><span className="text-slate-400">Quotes & LPO documents</span></span></p>
              <p className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-accent-500"><MapPin size={17} /></span><span><strong className="block text-white">Enterprise Road, Industrial Area, Nairobi</strong><span className="text-slate-400">Pickup & trade counter</span></span></p>
              <p className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-accent-500"><Clock size={17} /></span><span><strong className="block text-white">Mon–Sat, 8:00am–6:00pm EAT</strong><span className="text-slate-400">Closed Sundays & public holidays</span></span></p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <a href={waLink("Hello SAFETYPRO AFRICA, I have an enquiry.")} target="_blank" rel="noopener" className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-bold text-white"><WhatsAppIcon size={16} /> WhatsApp</a>
              <a href="/bulk-ppe" className="flex items-center justify-center gap-2 rounded-xl bg-accent-500 py-3 text-sm font-extrabold text-navy-950">Get quotation</a>
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl border border-slate-200">
            <iframe title="SafetyPro Africa location map" src="https://www.google.com/maps?q=Enterprise+Road+Industrial+Area+Nairobi&output=embed"
              className="h-64 w-full" loading="lazy" />
          </div>
        </div>

        <div className="h-fit rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          {done ? (
            <div className="py-10 text-center">
              <CheckCircle2 size={52} className="mx-auto text-emerald-500" />
              <h2 className="mt-3 text-2xl font-extrabold text-navy-950">Message received</h2>
              <p className="mt-2 text-slate-500">We reply within one business day. For urgent site needs, WhatsApp us now.</p>
            </div>
          ) : (
            <form onSubmit={submit}>
              <h2 className="font-extrabold text-navy-950">Send us a message</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Full name *"><input required className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Jane Wanjiku" /></Field>
                <Field label="Email *"><input required type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@company.co.ke" /></Field>
                <Field label="Phone"><input className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="0715 135 141" /></Field>
                <Field label="Subject"><input className={inputCls} value={form.subject} onChange={(e) => set("subject", e.target.value)} placeholder="Bulk helmets enquiry" /></Field>
              </div>
              <div className="mt-4"><Field label="Message *"><textarea required rows={5} className={inputCls} value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="Tell us quantities, site location and timelines…" /></Field></div>
              {error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">{error}</p>}
              <button disabled={sending} className="mt-4 w-full rounded-xl bg-navy-950 py-3.5 text-sm font-extrabold uppercase text-white hover:bg-safety-600 disabled:opacity-60">
                {sending ? "Sending…" : "Send message"}
              </button>
            </form>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
