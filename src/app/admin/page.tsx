import Link from "next/link";
import { AlertTriangle, FileText, Package, ShoppingCart, Users } from "lucide-react";
import { db } from "@/lib/db";
import { PRODUCTS } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  let stats = { revenue: 0, orders: 0, pendingOrders: 0, newQuotes: 0, customers: 0, products: PRODUCTS.length, lowStock: [] as any[] };

  if (db) {
    try {
      const [orders, quotes, users, products, low] = await Promise.all([
        db.order.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
        db.quotation.count({ where: { status: "NEW" } }),
        db.user.count(),
        db.product.count(),
        db.product.findMany({ where: { stock: { lt: 15 } }, take: 8, select: { name: true, sku: true, stock: true } }),
      ]);
      stats = {
        revenue: orders.reduce((a, o) => a + Number(o.total), 0),
        orders: await db.order.count(),
        pendingOrders: await db.order.count({ where: { status: "PENDING" } }),
        newQuotes: quotes, customers: users, products, lowStock: low,
      };
    } catch { /* demo */ }
  } else {
    stats.lowStock = PRODUCTS.filter((p) => p.stock < 100).slice(0, 8).map((p) => ({ name: p.name, sku: p.sku, stock: p.stock }));
  }

  const cards = [
    ["Revenue (recent)", `KES ${stats.revenue.toLocaleString()}`, ShoppingCart, "/admin/orders"],
    ["Orders", String(stats.orders), Package, "/admin/orders"],
    ["Pending orders", String(stats.pendingOrders), AlertTriangle, "/admin/orders"],
    ["New quotations", String(stats.newQuotes), FileText, "/admin/quotations"],
    ["Customers", String(stats.customers), Users, "/admin/customers"],
    ["Products live", String(stats.products), Package, "/admin/products"],
  ];

  return (
    <div>
      {!db && (
        <p className="mb-4 rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-800 ring-1 ring-amber-200">
          Demo mode — PostgreSQL not connected. Set DATABASE_URL and run <code className="font-mono">npm run db:push && npm run db:seed</code> for live data. Storefront uses the built-in catalog meanwhile.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([t, v, Icon, href]: any) => (
          <Link key={t} href={href} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-lg">
            <Icon size={20} className="text-safety-600" />
            <p className="mt-2 text-2xl font-extrabold text-navy-950">{v}</p>
            <p className="text-[13px] font-semibold text-slate-500">{t}</p>
          </Link>
        ))}
      </div>
      <div className="mt-6 rounded-2xl border border-red-200 bg-white p-5">
        <h2 className="flex items-center gap-2 font-extrabold text-navy-950"><AlertTriangle size={18} className="text-red-500" /> Low stock alerts</h2>
        {stats.lowStock.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">All lines healthy.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100 text-sm">
            {stats.lowStock.map((p: any) => (
              <li key={p.sku} className="flex justify-between py-2"><span className="text-slate-600">{p.name} <span className="font-mono text-xs text-slate-400">{p.sku}</span></span><strong className="text-red-500">{p.stock} left</strong></li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
