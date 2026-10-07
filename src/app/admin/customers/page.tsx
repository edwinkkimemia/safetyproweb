import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  let users: any[] = [];
  let companies: any[] = [];
  if (db) {
    try {
      users = await db.user.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { company: true } });
      companies = await db.company.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
    } catch { /* demo */ }
  }
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section>
        <h2 className="text-lg font-extrabold text-navy-950">Customers ({users.length})</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {users.length === 0 && <p className="p-6 text-sm text-slate-500">No registered accounts yet.</p>}
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between border-b border-slate-100 px-4 py-3 text-sm last:border-0">
              <div><p className="font-bold text-navy-950">{u.name ?? "—"}</p><p className="text-xs text-slate-500">{u.email}{u.company ? ` • ${u.company.name}` : ""}</p></div>
              <span className="rounded-md bg-mist px-2 py-1 text-[11px] font-bold">{u.role}</span>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-lg font-extrabold text-navy-950">Companies ({companies.length})</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {companies.length === 0 && <p className="p-6 text-sm text-slate-500">No company accounts yet.</p>}
          {companies.map((c: any) => (
            <div key={c.id} className="border-b border-slate-100 px-4 py-3 text-sm last:border-0">
              <p className="font-bold text-navy-950">{c.name} {c.creditApproved ? <span className="ml-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">CREDIT OK</span> : <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">STANDARD</span>}</p>
              <p className="text-xs text-slate-500">{c.contactPerson ?? ""} • {c.email ?? ""} • {c.phone ?? ""} • {c.industry ?? ""}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
