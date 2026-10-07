"use client";

import { useState } from "react";
import { setOrderStatus, setQuotationStatus } from "@/lib/admin-actions";

const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "READY", "DISPATCHED", "DELIVERED", "CANCELLED"];
const QUOTE_STATUSES = ["NEW", "REVIEWING", "QUOTED", "ACCEPTED", "REJECTED", "COMPLETED"];

export function OrderStatusSelect({ id, status }: { id: string; status: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <select defaultValue={status} disabled={busy} onChange={async (e) => {
      setBusy(true);
      try { await setOrderStatus(id, e.target.value); } catch (err: any) { alert(err.message); }
      setBusy(false);
    }} className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-bold">
      {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
    </select>
  );
}

export function QuoteStatusSelect({ id, status }: { id: string; status: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <select defaultValue={status} disabled={busy} onChange={async (e) => {
      setBusy(true);
      try { await setQuotationStatus(id, e.target.value); } catch (err: any) { alert(err.message); }
      setBusy(false);
    }} className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-bold">
      {QUOTE_STATUSES.map((s) => <option key={s}>{s}</option>)}
    </select>
  );
}
