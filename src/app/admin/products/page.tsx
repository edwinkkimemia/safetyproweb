import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { PRODUCTS } from "@/lib/catalog";
import { kes } from "@/lib/format";
import { DeleteProductButton } from "./delete-button";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  let rows: any[] = [];
  if (db) {
    try {
      rows = await db.product.findMany({ orderBy: { updatedAt: "desc" }, include: { category: true, brand: true } });
    } catch { /* fallback */ }
  }
  const list = rows.length ? rows.map((r) => ({ id: r.id, name: r.name, sku: r.sku, price: Number(r.price), stock: r.stock, category: r.category?.name ?? "—", brand: r.brand?.name ?? "—", featured: r.featured })) : PRODUCTS.map((p) => ({ id: p.slug, name: p.name, sku: p.sku, price: p.price, stock: p.stock, category: p.category, brand: p.brand, featured: !!p.featured, demo: true }));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-navy-950">Products ({list.length})</h2>
        <Link href="/admin/products/new" className="inline-flex items-center gap-1.5 rounded-xl bg-navy-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-safety-600"><Plus size={16} /> New product</Link>
      </div>
      <div className="nice-scroll mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="bg-navy-950 text-left text-xs uppercase tracking-wider text-white">
              <th className="px-4 py-3">Product</th><th className="px-4 py-3">SKU</th><th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((p) => (
              <tr key={p.id} className="hover:bg-mist">
                <td className="px-4 py-3 font-bold text-navy-950">{p.name} {p.featured && <span className="ml-1 rounded bg-accent-100 px-1.5 py-0.5 text-[10px] font-bold text-accent-700">FEATURED</span>}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.sku}</td>
                <td className="px-4 py-3 text-slate-500">{p.category}</td>
                <td className="px-4 py-3 font-bold">{kes(p.price)}</td>
                <td className="px-4 py-3"><span className={p.stock < 15 ? "font-bold text-red-500" : ""}>{p.stock}</span></td>
                <td className="px-4 py-3 text-right">
                  {(p as any).demo ? (
                    <span className="text-xs text-slate-400">Demo — connect DB to edit</span>
                  ) : (
                    <span className="inline-flex gap-2">
                      <Link href={`/admin/products/${p.id}`} className="rounded-lg bg-mist px-3 py-1.5 text-xs font-bold text-navy-950 hover:bg-safety-100">Edit</Link>
                      <DeleteProductButton id={p.id} />
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
