"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, User } from "lucide-react";
import { INDUSTRIES } from "@/lib/catalog";
import { Field, inputCls } from "@/components/ui";
import { cn } from "@/lib/utils";

function RegisterForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const [type, setType] = useState(sp.get("type") === "company" ? "company" : "individual");
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", companyName: "", industry: "" });
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true); setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, accountType: type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Registration failed.");
      router.push("/login?registered=1");
    } catch (err: any) { setError(err.message); }
    finally { setSending(false); }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8">
        <h1 className="text-2xl font-extrabold text-navy-950">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">Company accounts unlock LPO terms, saved lists and order history.</p>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {(["individual", "company"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setType(t)}
              className={cn("flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-bold transition",
                type === t ? "border-navy-950 bg-navy-950 text-white" : "border-slate-200 text-slate-500 hover:border-slate-300")}>
              {t === "company" ? <Building2 size={16} /> : <User size={16} />} {t === "company" ? "Company" : "Individual"}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="mt-5 grid gap-4">
          {type === "company" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Company name *"><input required={type === "company"} className={inputCls} value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="Acme Ltd" /></Field>
              <Field label="Industry">
                <select className={inputCls} value={form.industry} onChange={(e) => set("industry", e.target.value)}>
                  <option value="">Select…</option>
                  {INDUSTRIES.map((i) => <option key={i.slug} value={i.name}>{i.name}</option>)}
                </select>
              </Field>
            </div>
          )}
          <Field label="Full name *"><input required className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Jane Wanjiku" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email *"><input required type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@company.co.ke" /></Field>
            <Field label="Phone"><input className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="0729 396 174" /></Field>
          </div>
          <Field label="Password * (min 8 characters)"><input required minLength={8} type="password" className={inputCls} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="••••••••" /></Field>
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">{error}</p>}
          <button disabled={sending} className="w-full rounded-xl bg-accent-500 py-3.5 text-sm font-extrabold uppercase text-navy-950 hover:bg-navy-950 hover:text-white disabled:opacity-60">
            {sending ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">Have an account? <Link href="/login" className="font-bold text-safety-600 hover:underline">Sign in</Link></p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>;
}
