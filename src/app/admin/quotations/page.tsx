import { db } from "@/lib/db";
import { QuoteStatusSelect } from "../status-selects";

export const dynamic = "force-dynamic";

export default async function AdminQuotesPage() {
  let quotes: any[] = [];
  if (db) {
    try { quotes = await db.quotation.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { items: true, documents: true } }); } catch { /* demo */ }
  }
  return (
    <div>
      <h2 className="text-lg font-extrabold text-navy-950">Quotations ({quotes.length})</h2>
      {quotes.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          No quotation requests yet. Bulk & corporate requests from /bulk-ppe land here with uploaded PPE lists.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {quotes.map((q) => (
            <details key={q.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-navy-950"><span className="font-mono">{q.quoteNo}</span> • {q.companyName} <span className="text-xs font-medium text-slate-400">{new Date(q.createdAt).toLocaleString()}</span></span>
                <QuoteStatusSelect id={q.id} status={q.status} />
              </summary>
              <div className="mt-3 grid gap-3 text-[13px] sm:grid-cols-2">
                <div className="rounded-xl bg-mist p-3 text-slate-600">
                  <p><strong className="text-navy-950">{q.contactPerson}</strong> • {q.email} • {q.phone}</p>
                  <p>Industry: {q.industry ?? "—"} • Delivery: {q.deliveryLoc ?? "—"}{q.deliveryDate ? ` by ${new Date(q.deliveryDate).toLocaleDateString()}` : ""}</p>
                  {q.employeeSizes && <p className="mt-1">Sizes: {q.employeeSizes}</p>}
                  {q.specs && <p className="mt-1">Specs: {q.specs}</p>}
                  {q.brands && <p className="mt-1">Brands: {q.brands}</p>}
                  {q.notes && <p className="mt-1">Notes: {q.notes}</p>}
                  {q.documents.length > 0 && (
                    <p className="mt-1 font-semibold">📎 {q.documents.map((d: any) => d.filename).join(", ")}</p>
                  )}
                </div>
                <ul className="divide-y divide-slate-100 rounded-xl bg-mist p-3">
                  {q.items.map((i: any) => <li key={i.id} className="flex justify-between py-1"><span>{i.name}</span><strong>× {i.quantity}</strong></li>)}
                  {q.items.length === 0 && <li className="text-slate-400">Lines in uploaded document.</li>}
                </ul>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
