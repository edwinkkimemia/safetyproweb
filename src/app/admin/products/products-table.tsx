"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { CheckSquare, Square, Trash2 } from "lucide-react";
import { kes } from "@/lib/format";
import { bulkDeleteProducts, bulkUpdateProducts, deleteProduct, updateProductQuick } from "@/lib/admin-actions";
import { cn } from "@/lib/utils";

export type AdminProductRow = {
  id: string;
  name: string;
  sku: string;
  slug: string;
  price: number;
  stock: number;
  category: string;
  brand: string;
  featured: boolean;
  isActive: boolean;
};

export function ProductsTable({ rows, canDelete, isFiltered }: { rows: AdminProductRow[]; canDelete: boolean; isFiltered: boolean }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");
  const allChecked = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const selCount = selected.size;

  const toggle = (id: string) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
  const toggleAll = () => setSelected(allChecked ? new Set() : new Set(rows.map((r) => r.id)));

  const run = (fn: () => Promise<{ updated: number; errors: string[] }>, verb: string) => {
    setMsg("");
    startTransition(async () => {
      try {
        const res = await fn();
        setMsg(res.errors.length ? res.errors.join(" ") : `${verb}: ${res.updated} product${res.updated === 1 ? "" : "s"}.`);
        setSelected(new Set());
      } catch (e: any) {
        setMsg(e.message ?? "Action failed.");
      }
    });
  };

  const ids = useMemo(() => [...selected], [selected]);

  return (
    <div>
      {/* bulk toolbar — sticky so it stays reachable on long lists */}
      {selCount > 0 && (
        <BulkToolbar count={selCount} ids={ids} pending={pending} run={run} canDelete={canDelete} onClear={() => setSelected(new Set())} />
      )}
      {msg && (
        <p className={cn("mt-2 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold", /fail|unauth|error|cannot/i.test(msg) ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700")}>
          {msg}
        </p>
      )}

      <div className="nice-scroll mt-3 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="bg-navy-950 text-left text-xs uppercase tracking-wider text-white">
              <th className="w-10 px-3 py-3">
                <button onClick={toggleAll} aria-label={allChecked ? "Deselect all" : "Select all"} className="flex items-center text-white/80 hover:text-white">
                  {allChecked ? <CheckSquare size={16} /> : <Square size={16} />}
                </button>
              </th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((p) => (
              <tr key={p.id} className={cn("hover:bg-mist", selected.has(p.id) && "bg-safety-50/60")}>
                <td className="px-3 py-3">
                  <button onClick={() => toggle(p.id)} aria-label={`Select ${p.name}`} aria-pressed={selected.has(p.id)} className="text-slate-400 hover:text-safety-600">
                    {selected.has(p.id) ? <CheckSquare size={16} className="text-safety-600" /> : <Square size={16} />}
                  </button>
                </td>
                <td className="max-w-[280px] px-4 py-3">
                  <Link href={`/product/${p.slug}`} target="_blank" className="font-bold text-navy-950 hover:text-safety-600 hover:underline" title="Open storefront page">
                    {p.name}
                  </Link>
                  <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
                    {p.featured && <span className="rounded bg-accent-100 px-1.5 py-0.5 text-[10px] font-bold text-accent-700">FEATURED</span>}
                    {!p.isActive && <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">INACTIVE</span>}
                    <span className="text-[11px] text-slate-400">{p.brand}</span>
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.sku}</td>
                <td className="px-4 py-3 text-slate-500">{p.category}</td>
                <td className="px-4 py-3 font-bold">{kes(p.price)}</td>
                <td className="px-4 py-3">
                  <span className={cn("font-semibold", p.stock === 0 ? "font-bold text-red-600" : p.stock < 15 ? "font-bold text-amber-600" : "text-slate-600")}>{p.stock}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-2">
                    <Link href={`/admin/products/${p.id}`} className="rounded-lg bg-mist px-3 py-1.5 text-xs font-bold text-navy-950 hover:bg-safety-100">Edit</Link>
                    <QuickEdit id={p.id} price={p.price} stock={p.stock} />
                    {canDelete && (
                      <button
                        disabled={pending}
                        onClick={() => {
                          if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
                          setMsg("");
                          startTransition(async () => {
                            try {
                              await deleteProduct(p.id);
                              setMsg("Product deleted.");
                              setSelected((prev) => { const n = new Set(prev); n.delete(p.id); return n; });
                            } catch (e: any) {
                              setMsg(e.message ?? "Delete failed.");
                            }
                          });
                        }}
                        aria-label={`Delete ${p.name}`}
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-50" title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                  {isFiltered ? "No products match these filters — clear them to see all." : "No products yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function QuickEdit({ id, price, stock }: { id: string; price: number; stock: number }) {
  const [open, setOpen] = useState(false);
  const [p, setP] = useState(String(price));
  const [s, setS] = useState(String(stock));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  if (!open) {
    return <button onClick={() => { setOpen(true); setErr(""); }} className="rounded-lg bg-mist px-3 py-1.5 text-xs font-bold text-navy-950 hover:bg-safety-100">Price/stock</button>;
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      <input value={p} onChange={(e) => setP(e.target.value)} inputMode="numeric" aria-label="Price" className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-semibold" />
      <input value={s} onChange={(e) => setS(e.target.value)} inputMode="numeric" aria-label="Stock" className="w-14 rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-semibold" />
      <button
        disabled={busy}
        onClick={async () => {
          setBusy(true); setErr("");
          try {
            const res = await updateProductQuick(id, p, s);
            if (res.errors.length) setErr(res.errors.join(" "));
            else { setOpen(false); window.location.reload(); }
          } catch (e: any) { setErr(e.message); }
          setBusy(false);
        }}
        className="rounded-lg bg-navy-950 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-safety-600 disabled:opacity-50"
      >Save</button>
      <button onClick={() => setOpen(false)} className="rounded-lg px-2 py-1.5 text-xs font-bold text-slate-500 hover:bg-mist">Cancel</button>
      {err && <span className="text-[11px] font-semibold text-red-600">{err}</span>}
    </span>
  );
}

function BulkToolbar({ count, ids, pending, run, canDelete, onClear }: {
  count: number;
  ids: string[];
  pending: boolean;
  run: (fn: () => Promise<{ updated: number; errors: string[] }>, verb: string) => void;
  canDelete: boolean;
  onClear: () => void;
}) {
  const [op, setOp] = useState("activate");
  const [value, setValue] = useState("");
  const needsValue = ["setPrice", "priceUpPct", "priceDownPct", "setStock", "stockDelta"].includes(op);

  return (
    <div className="sticky top-2 z-10 mt-3 flex flex-wrap items-center gap-2 rounded-2xl border border-navy-950/10 bg-navy-950 px-3.5 py-3 text-white shadow-lg">
      <p className="text-[13px] font-bold">{count} selected</p>
      <span className="mx-1 h-5 w-px bg-white/20" />
      <select value={op} onChange={(e) => setOp(e.target.value)} className="rounded-lg border border-white/20 bg-navy-800 px-2.5 py-2 text-xs font-bold">
        <option value="activate">Set active</option>
        <option value="deactivate">Set inactive</option>
        <option value="feature">Mark featured</option>
        <option value="unfeature">Remove featured</option>
        <option value="setPrice">Set price (KES)</option>
        <option value="priceUpPct">Increase price %</option>
        <option value="priceDownPct">Reduce price %</option>
        <option value="setStock">Set stock</option>
        <option value="stockDelta">Adjust stock ±</option>
      </select>
      {needsValue && (
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          inputMode={op.includes("Pct") || op === "stockDelta" ? "text" : "numeric"}
          placeholder={op === "stockDelta" ? "e.g. -5" : op.includes("Pct") ? "%" : "Value"}
          aria-label="Bulk value"
          className="w-24 rounded-lg border border-white/20 bg-navy-800 px-2.5 py-2 text-xs font-semibold placeholder:text-white/40"
        />
      )}
      <button
        disabled={pending}
        onClick={() => run(() => bulkUpdateProducts(ids, op, value), "Updated")}
        className="rounded-lg bg-accent-500 px-3.5 py-2 text-xs font-extrabold uppercase text-navy-950 hover:bg-white disabled:opacity-50"
      >
        {pending ? "Working…" : "Apply"}
      </button>
      {canDelete && (
        <button
          disabled={pending}
          onClick={() => {
            if (!confirm(`Delete ${count} product${count === 1 ? "" : "s"}? This cannot be undone.`)) return;
            run(() => bulkDeleteProducts(ids), "Deleted");
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/90 px-3.5 py-2 text-xs font-extrabold uppercase hover:bg-red-500 disabled:opacity-50"
        >
          <Trash2 size={13} /> Delete
        </button>
      )}
      <button onClick={onClear} className="ml-auto rounded-lg px-3 py-2 text-xs font-bold text-white/70 hover:text-white">Clear</button>
    </div>
  );
}
