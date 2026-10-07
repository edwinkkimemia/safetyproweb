import { saveSettings } from "@/lib/admin-actions";
import { db } from "@/lib/db";
import { inputCls, Field } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  if (!db) return <p className="rounded-2xl bg-amber-50 p-6 text-sm font-semibold text-amber-800">Connect PostgreSQL to manage settings. The storefront currently uses environment defaults.</p>;
  let s: any = null;
  try { s = await db.siteSettings.findUnique({ where: { id: 1 } }); } catch { /* ignore */ }
  return (
    <div>
      <h2 className="mb-4 text-lg font-extrabold text-navy-950">Business settings</h2>
      <form action={saveSettings} className="grid max-w-2xl gap-4 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone"><input name="phone" defaultValue={s?.phone ?? ""} className={inputCls} /></Field>
          <Field label="WhatsApp number (254…)"><input name="whatsapp" defaultValue={s?.whatsapp ?? ""} className={inputCls} /></Field>
          <Field label="Email"><input name="email" type="email" defaultValue={s?.email ?? ""} className={inputCls} /></Field>
          <Field label="M-Pesa Paybill"><input name="mpesaPaybill" defaultValue={s?.mpesaPaybill ?? ""} className={inputCls} /></Field>
        </div>
        <Field label="Address"><input name="address" defaultValue={s?.address ?? ""} className={inputCls} /></Field>
        <button className="rounded-xl bg-navy-950 py-3.5 text-sm font-extrabold uppercase text-white hover:bg-safety-600">Save settings</button>
      </form>
    </div>
  );
}
