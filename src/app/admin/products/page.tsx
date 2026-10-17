import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { PRODUCTS } from "@/lib/catalog";
import { kes } from "@/lib/format";
import { auth } from "@/auth";
import { ProductsTable, type AdminProductRow } from "./products-table";

export const dynamic = "force-dynamic";

const ADMINS = ["SUPER_ADMIN", "ADMIN"];

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; stock?: string; status?: string }> }) {
  const sp = await searchParams;
  const session = await auth();
  const role = (session?.user as any)?.role as string | undefined;
  const isAdmin = ADMINS.includes(role ?? "");

  let rows: any[] = [];
  let catNames: string[] = [];
  if (db) {
    try {
      [rows, catNames] = await Promise.all([
        db.product.findMany({ orderBy: { updatedAt: "desc" }, include: { category: true, brand: true } }),
        db.category.findMany({ orderBy: { name: "asc" } }).then((cs) => cs.map((c) => c.name)),
      ]);
    } catch { /* fallback below */ }
  }

  const demo = rows.length === 0;
  const list: AdminProductRow[] = demo
    ? PRODUCTS.map((p) => ({ id: p.slug, name: p.name, sku: p.sku, slug: p.slug, price: p.price, stock: p.stock, category: p.category, brand: p.brand, featured: !!p.featured, isActive: true }))
    : rows.map((r) => ({ id: r.id, name: r.name, sku: r.sku, slug: r.slug, price: Number(r.price), stock: r.stock, category: r.category?.name ?? "—", brand: r.brand?.name ?? "—", featured: r.featured, isActive: r.isActive }));

  // Category options — DB names when connected, else names found in the fallback list.
  const catOptions = [...new Set(demo ? list.map((p) => p.category) : catNames)].sort();

  // Server-side filtering (works on large catalogs without shipping everything).
  const q = (sp.q ?? "").trim().toLowerCase();
  const stockFilter = sp.stock ?? "";
  const statusFilter = sp.status ?? "";
  const filtered = list.filter((p) => {
    if (q && !(`${p.name} ${p.sku} ${p.slug} ${p.brand}`.toLowerCase().includes(q))) return false;
    if (sp.category && p.category !== sp.category) return false;
    if (stockFilter === "low" && !(p.stock > 0 && p.stock < 15)) return false;
    if (stockFilter === "out" && p.stock !== 0) return false;
    if (stockFilter === "ok" && p.stock < 15) return false;
    if (statusFilter === "active" && !p.isActive) return false;
    if (statusFilter === "inactive" && p.isActive) return false;
    if (statusFilter === "featured" && !p.featured) return false;
    return true;
  });

  const lowCount = list.filter((p) => p.stock > 0 && p.stock < 15).length;
  const outCount = list.filter((p) => p.stock === 0).length;

  const buildHref = (patch: Record<string, string>) => {
    const next = { q: sp.q ?? "", category: sp.category ?? "", stock: sp.stock ?? "", status: sp.status ?? "", ...patch };
    const qs = Object.entries(next).filter(([, v]) => v).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
    return `/admin/products${qs ? `?${qs}` : ""}`;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold text-navy-950">
          Products ({filtered.length}{filtered.length !== list.length ? ` of ${list.length}` : ""})
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {lowCount > 0 && <span className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 ring-1 ring-amber-200">{lowCount} low stock</span>}
          {outCount > 0 && <span className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 ring-1 ring-red-200">{outCount} out of stock</span>}
          <Link href="/admin/products/new" className="inline-flex items-center gap-1.5 rounded-xl bg-navy-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-safety-600"><Plus size={16} /> New product</Link>
        </div>
      </div>

      {/* filters */}
      <form method="GET" action="/admin/products" className="mt-4 grid gap-2 rounded-2xl border border-slate-200 bg-white p-3 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto_auto]">
        <input name="q" defaultValue={sp.q ?? ""} placeholder="Search name, SKU, slug or brand…"
          className="rounded-xl border border-slate-300 bg-mist px-3.5 py-2.5 text-sm outline-none focus:border-safety-600" />
        <select name="category" defaultValue={sp.category ?? ""} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold">
          <option value="">All categories</option>
          {catOptions.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select name="stock" defaultValue={sp.stock ?? ""} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold">
          <option value="">Any stock</option>
          <option value="low">Low (1–14)</option>
          <option value="out">Out of stock</option>
          <option value="ok">Healthy (15+)</option>
        </select>
        <select name="status" defaultValue={sp.status ?? ""} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold">
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="featured">Featured</option>
        </select>
        <button className="rounded-xl bg-navy-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-safety-600">Filter</button>
      </form>
      {(q || sp.category || sp.stock || sp.status) && (
        <p className="mt-2 text-xs font-semibold text-slate-500">
          Filtering active — <Link href="/admin/products" className="font-bold text-safety-600 hover:underline">clear all</Link>
          {" · "}
          {[{ label: "low stock", v: "low" }, { label: "out of stock", v: "out" }].map(({ label, v }) => (
            <Link key={v} href={buildHref({ stock: v })} className="mr-2 font-bold text-safety-600 hover:underline">{label}</Link>
          ))}
        </p>
      )}

      <ProductsTable
        rows={filtered}
        canDelete={isAdmin}
        isFiltered={Boolean(q || sp.category || sp.stock || sp.status)}
      />

      <p className="mt-3 text-xs text-slate-400">
        Tip: product names link straight to the storefront page — check how a product renders after saving.
      </p>
    </div>
  );
}
