import { db } from "@/lib/db";
import { kes } from "@/lib/format";
import { OrderStatusSelect } from "../status-selects";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  let orders: any[] = [];
  if (db) {
    try { orders = await db.order.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { items: true } }); } catch { /* demo */ }
  }
  return (
    <div>
      <h2 className="text-lg font-extrabold text-navy-950">Orders ({orders.length})</h2>
      {orders.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          No orders yet. Checkout orders from the storefront appear here with full customer, delivery and M-Pesa details.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {orders.map((o) => (
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
                  <p className="mt-1 font-semibold">Pay: {o.paymentMethod} • {o.paymentStatus}{o.mpesaReceipt ? ` • ${o.mpesaReceipt}` : ""}</p>
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
