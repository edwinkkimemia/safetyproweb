import { db } from "@/lib/db";
import { auth } from "@/auth";
import { CustomerRowActions, CompanyCreditToggle } from "./row-actions";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

const ADMINS = ["SUPER_ADMIN", "ADMIN"];

export default async function AdminCustomersPage() {
  const session = await auth();
  const role = (session?.user as any)?.role as string | undefined;
  const isAdmin = ADMINS.includes(role ?? "");
  const myId = (session?.user as any)?.id as string | undefined;

  let users: any[] = [];
  let companies: any[] = [];
  if (db) {
    try {
      users = await db.user.findMany({ orderBy: { createdAt: "desc" }, take: 200, include: { company: true, _count: { select: { orders: true } } } });
      companies = await db.company.findMany({ orderBy: { createdAt: "desc" }, take: 200, include: { _count: { select: { users: true, orders: true } } } });
    } catch { /* demo */ }
  }

  const staffCount = users.filter((u) => u.role !== "CUSTOMER").length;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-navy-950">Customers ({users.length})</h2>
          {staffCount > 0 && <span className="inline-flex items-center gap-1 rounded-lg bg-safety-50 px-2.5 py-1.5 text-[11px] font-bold text-safety-700 ring-1 ring-safety-600/20"><ShieldCheck size={12} /> {staffCount} staff</span>}
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {users.length === 0 && <p className="p-6 text-sm text-slate-500">No registered accounts yet.</p>}
          {users.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 text-sm last:border-0">
              <div className="min-w-0">
                <p className="font-bold text-navy-950">
                  {u.name ?? "—"}
                  {u.id === myId && <span className="ml-1.5 rounded bg-accent-100 px-1.5 py-0.5 text-[10px] font-bold text-accent-700">YOU</span>}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {u.email}
                  {u.company ? ` • ${u.company.name}` : ""}
                  {u._count?.orders ? ` • ${u._count.orders} order${u._count.orders === 1 ? "" : "s"}` : ""}
                </p>
              </div>
              <CustomerRowActions userId={u.id} role={u.role} isAdmin={isAdmin} isSelf={u.id === myId} />
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Staff roles: SUPER_ADMIN, ADMIN (full access incl. delete & pricing) · SALES (orders, quotes, customers) · PROCUREMENT (quotes, settings) · INVENTORY (products, stock). New role changes take effect at the user's next sign-in.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-extrabold text-navy-950">Companies ({companies.length})</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {companies.length === 0 && <p className="p-6 text-sm text-slate-500">No company accounts yet.</p>}
          {companies.map((c: any) => (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 text-sm last:border-0">
              <div className="min-w-0">
                <p className="font-bold text-navy-950">{c.name}</p>
                <p className="truncate text-xs text-slate-500">
                  {[c.contactPerson, c.email, c.phone, c.industry].filter(Boolean).join(" • ")}
                  {c._count?.users ? ` • ${c._count.users} user${c._count.users === 1 ? "" : "s"}` : ""}
                  {c._count?.orders ? ` • ${c._count.orders} order${c._count.orders === 1 ? "" : "s"}` : ""}
                </p>
              </div>
              <CompanyCreditToggle companyId={c.id} approved={c.creditApproved} canApprove={isAdmin} />
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Credit approval unlocks LPO & 30-day terms messaging for that account. Approve only after references or deposit checks.
        </p>
      </section>
    </div>
  );
}
