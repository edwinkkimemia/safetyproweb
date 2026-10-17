import Link from "next/link";
import { db } from "@/lib/db";
import { kes } from "@/lib/format";
import { cn } from "@/lib/utils";
import { OrderStatusSelect, PaymentStatusSelect } from "../status-selects";

export const dynamic = "force-dynamic";

const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "READY", "DISPATCHED", "DELIVERED", "CANCELLED"];

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const sp = await searchParams;
  const status = sp.status ?? "";
  const q = (sp.q ?? "").trim().toLowerCase();

  let orders: any[] = [];
  if (db) {
    try {
      orders = await db.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
        include: { items: true },
        ...(status ? { where: { status: status as any } } : {}),
      });
    } catch { /* demo */ }
  }

  const shown = q
    ? orders.filter((o) => `${o.orderNo} ${o.customerName} ${o.customerEmail} ${o.customerPhone} ${o.companyName ?? ""}`.toLowerCase().includes(q))
    : orders;

  const countFor = (s: string) => orders.filter((o) => o.status === s).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold text-navy-950">Orders ({shown.length}{q || status ? ` of ${orders.length}` : ""})</h2>
        <form method="GET" action="/admin/orders" className="flex flex-wrap items-center gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <input name="q" defaultValue={sp.q ?? ""} placeholder="Search order no, name, phone…"
            className="rounded-xl border border-slate-300 bg-mist px-3.5 py-2.5 text-sm outline-none focus:border-safety-600" />
          <button className="rounded-xl bg-navy-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-safety-600">Search</button>
        </form>
      </div>

      {/* status tabs */}
      <div className="nice-scroll mt-4 flex gap-2 overflow-x-auto pb-1">
        <Link href={q ? `/admin/orders?q=${encodeURIComponent(q)}` : "/admin/orders"}
          className={cn("shrink-0 rounded-xl px-3.5 py-2 text-[13px] font-bold transition", !status ? "bg-navy-950 text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-safety-600 hover:text-safety-600")}>
          All ({orders.length})
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s} href={`/admin/orders?status=${s}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={cn("shrink-0 rounded-xl px-3.5 py-2 text-[13px] font-bold transition", status === s ? "bg-navy-950 text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-safety-600 hover:text-safety-600")}>
            {s[0] + s.slice(1).toLowerCase()} ({countFor(s)})
          </Link>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          {q || status ? "No orders match this filter." : "No orders yet. Checkout orders from the storefront appear here with full customer, delivery and M-Pesa details."}
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {shown.map((o) => (
            <details key={o.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2">
                <span className="font-mono font-bold text-navy-950">{o.orderNo} <span className="font-sans text-xs font-medium text-slate-400">{new Date(o.createdAt).toLocaleString()}</span></span>
                <span className="flex items-center gap-2">
                  <strong>{kes(Number(o.total))}</strong>
                  <OrderStatusSelect id={o.id} status={o.status} />
                </span>
              </summary>
              <div className="mt-3 grid gap-3 text-[13px] sm:grid-cols-2">
                <div className="rounded-xl bg-mist p-3">
                  <p className="font-bold text-navy-950">{o.customerName} {o.companyName ? `• ${o.companyName}` : ""}</p>
                  <p className="text-slate-500">{o.customerEmail} • {o.customerPhone}</p>
                  <p className="text-slate-500">{o.address}, {o.town}, {o.county}</p>
                  {o.notes && <p className="mt-1 text-slate-500">Note: {o.notes}</p>}
                  <p className="mt-1.5 flex flex-wrap items-center gap-2 font-semibold">
                    Pay: {o.paymentMethod}
                    <PaymentStatusSelect id={o.id} status={o.paymentStatus} />
                    {o.mpesaReceipt ? <span className="font-mono text-xs">{o.mpesaReceipt}</span> : ""}
                  </p>
                  <p className="mt-1.5 flex flex-wrap gap-3 text-xs font-bold">
                    <a href={`tel:${o.customerPhone}`} className="text-safety-600 hover:text-accent-600">Call customer</a>
                    <a href={`mailto:${o.customerEmail}?subject=${encodeURIComponent(`Order ${o.orderNo} — SAFETYPRO AFRICA`)}`} className="text-safety-600 hover:text-accent-600">Email customer</a>
                  </p>
                </div>
                <ul className="divide-y divide-slate-100 rounded-xl bg-mist p-3">
                  {o.items.map((i: any) => (
                    <li key={i.id} className="flex justify-between py-1"><span>{i.quantity} × {i.name}</span><strong>{kes(Number(i.subtotal))}</strong></li>
                  ))}
                </ul>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
