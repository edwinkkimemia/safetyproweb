import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { COUNTIES } from "@/lib/catalog";
import { db } from "@/lib/db";
import { inputCls, Field } from "@/components/ui";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function addAddress(form: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.email || !db) return;
  const u = await db.user.findUnique({ where: { email: session.user.email } });
  if (!u) return;
  await db.customerAddress.create({
    data: {
      userId: u.id,
      label: String(form.get("label") || "Home"),
      address: String(form.get("address") || ""),
      county: String(form.get("county") || "Nairobi"),
      town: String(form.get("town") || ""),
      phone: String(form.get("phone") || "") || null,
      isDefault: form.get("isDefault") === "on",
    },
  });
  revalidatePath("/account/addresses");
}

export default async function AddressesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account/addresses");
  let list: any[] = [];
  if (db) {
    try {
      const u = await db.user.findUnique({ where: { email: session.user.email! } });
      if (u) list = await db.customerAddress.findMany({ where: { userId: u.id } });
    } catch { /* demo */ }
  }
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:py-12">
      <h1 className="text-2xl font-extrabold text-navy-950">Saved addresses</h1>
      <div className="mt-4 space-y-3">
        {list.map((a) => (
          <div key={a.id} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
            <p className="font-bold text-navy-950">{a.label} {a.isDefault && <span className="ml-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">DEFAULT</span>}</p>
            <p className="text-slate-500">{a.address}, {a.town}, {a.county}{a.phone ? ` • ${a.phone}` : ""}</p>
          </div>
        ))}
        {list.length === 0 && <p className="rounded-2xl bg-mist p-6 text-center text-sm text-slate-500">No saved addresses yet. {db ? "Add your first delivery address below." : "Address saving activates once PostgreSQL is connected."}</p>}
      </div>
      {db && (
        <form action={addAddress} className="mt-6 grid gap-4 rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="font-extrabold text-navy-950">Add address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Label"><input name="label" defaultValue="Site office" className={inputCls} /></Field>
            <Field label="Phone"><input name="phone" className={inputCls} /></Field>
            <Field label="Address"><input name="address" required className={inputCls} placeholder="Plot, road, building" /></Field>
            <Field label="Town"><input name="town" required className={inputCls} /></Field>
            <Field label="County">
              <select name="county" className={inputCls}>{COUNTIES.map((c) => <option key={c}>{c}</option>)}</select>
            </Field>
            <label className="flex items-center gap-2 self-end rounded-xl bg-mist p-3 text-sm font-semibold"><input type="checkbox" name="isDefault" className="h-4 w-4 accent-safety-600" /> Default address</label>
          </div>
          <button className="rounded-xl bg-navy-950 py-3 text-sm font-extrabold uppercase text-white hover:bg-safety-600">Save address</button>
        </form>
      )}
    </div>
  );
}
