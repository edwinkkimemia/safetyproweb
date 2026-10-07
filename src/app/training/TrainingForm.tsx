"use client";

import { useState } from "react";
import { CheckCircle2, GraduationCap } from "lucide-react";
import { INDUSTRIES, COUNTIES } from "@/lib/catalog";
import { waLink } from "@/lib/whatsapp";
import { Field, inputCls, WhatsAppIcon } from "@/components/ui";

export const TRAINING_COURSES = [
  "First Aid at Work",
  "Fire Safety & Extinguisher Handling",
  "Work at Height & Fall Protection",
  "PPE Selection, Use & Maintenance",
  "HSE Induction for Supervisors",
  "Chemical Handling & Spill Response",
];

export function TrainingForm() {
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    companyName: "", contactPerson: "", email: "", phone: "", industry: "",
    course: "", trainees: "10", preferredDate: "", venue: "", notes: "",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true); setError("");
    try {
      const message = [
        `Course: ${form.course}`,
        `Trainees: ${form.trainees}`,
        `Preferred date: ${form.preferredDate || "Flexible"}`,
        `Venue: ${form.venue || "To be advised"}`,
        `Company: ${form.companyName}`,
        `Industry: ${form.industry || "—"}`,
        `Notes: ${form.notes || "—"}`,
      ].join("\n");
      const res = await fetch("/api/contact", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.contactPerson, email: form.email, phone: form.phone,
          subject: `Training request: ${form.course} — ${form.companyName}`,
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed.");
      setDone(true);
    } catch (err: any) { setError(err.message); }
    finally { setSending(false); }
  };

  if (done) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-10 text-center">
        <CheckCircle2 size={52} className="mx-auto text-emerald-600" />
        <h2 className="mt-3 text-2xl font-extrabold text-navy-950">Training request received</h2>
        <p className="mx-auto mt-2 max-w-md text-slate-600">
          Our training desk will call <strong className="text-navy-950">{form.phone || "you"}</strong> within
          one business day to confirm dates, group size and venue for <strong className="text-navy-950">{form.course}</strong>.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href="/shop" className="rounded-xl bg-navy-950 px-6 py-3 text-sm font-bold text-white hover:bg-safety-600">Kit out trainees meanwhile</a>
          <a href={waLink(`Hello SAFETYPRO AFRICA, I just requested ${form.course} training for ${form.companyName} and would like to confirm.`)} target="_blank" rel="noopener"
            className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-bold text-white"><WhatsAppIcon size={16} /> Confirm on WhatsApp</a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company name *"><input required className={inputCls} value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="Acme Construction Ltd" /></Field>
        <Field label="Contact person *"><input required className={inputCls} value={form.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} placeholder="HSE Manager" /></Field>
        <Field label="Work email *"><input required type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="hse@company.co.ke" /></Field>
        <Field label="Phone *"><input required className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="0715 135 141" /></Field>
        <Field label="Course *">
          <select required className={inputCls} value={form.course} onChange={(e) => set("course", e.target.value)}>
            <option value="">Select course…</option>
            {TRAINING_COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Trainees *"><input required type="number" min={1} max={500} className={inputCls} value={form.trainees} onChange={(e) => set("trainees", e.target.value)} /></Field>
        <Field label="Industry">
          <select className={inputCls} value={form.industry} onChange={(e) => set("industry", e.target.value)}>
            <option value="">Select industry…</option>
            {INDUSTRIES.map((i) => <option key={i.slug} value={i.name}>{i.name}</option>)}
          </select>
        </Field>
        <Field label="Preferred date"><input type="date" className={inputCls} value={form.preferredDate} onChange={(e) => set("preferredDate", e.target.value)} /></Field>
        <Field label="Venue (county)">
          <select className={inputCls} value={form.venue} onChange={(e) => set("venue", e.target.value)}>
            <option value="">On-site / select county…</option>
            {COUNTIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Notes"><textarea rows={3} className={inputCls} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Shifts, languages, previous training, compliance deadline…" /></Field>
      </div>

      {error && <p className="mt-4 rounded-xl bg-red-50 p-3.5 text-sm font-semibold text-red-600 ring-1 ring-red-200">{error}</p>}
      <button disabled={sending} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 py-4 text-[15px] font-extrabold uppercase tracking-wide text-navy-950 transition hover:bg-navy-950 hover:text-white disabled:opacity-60">
        <GraduationCap size={18} /> {sending ? "Sending request…" : "Request training"}
      </button>
      <p className="mt-2 text-center text-xs text-slate-400">Response within 1 business day • Training delivered on-site across Kenya</p>
    </form>
  );
}
