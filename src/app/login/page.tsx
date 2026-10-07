"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { ShieldCheck } from "lucide-react";
import { Field, inputCls } from "@/components/ui";

function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(sp.get("error") ? "Invalid email or password." : "");
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true); setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setSending(false);
    if (res?.error) { setError("Invalid email or password. Try the demo accounts below."); return; }
    router.push(sp.get("callbackUrl") ?? "/account");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8">
        <p className="flex items-center gap-2 font-extrabold text-navy-950"><ShieldCheck size={20} className="text-accent-600" /> Welcome back</p>
        <p className="mt-1 text-sm text-slate-500">Sign in to track orders, quotations and lists.</p>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <Field label="Email"><input type="email" required className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.co.ke" /></Field>
          <Field label="Password"><input type="password" required className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></Field>
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">{error}</p>}
          <button disabled={sending} className="w-full rounded-xl bg-navy-950 py-3.5 text-sm font-extrabold uppercase text-white hover:bg-safety-600 disabled:opacity-60">
            {sending ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">No account? <Link href="/register" className="font-bold text-safety-600 hover:underline">Create one</Link></p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
