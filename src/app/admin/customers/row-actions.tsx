"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setCompanyCredit, setUserRole } from "@/lib/admin-actions";
import { cn } from "@/lib/utils";

const ROLES = ["SUPER_ADMIN", "ADMIN", "SALES", "PROCUREMENT", "INVENTORY", "CUSTOMER"];

export function CustomerRowActions({ userId, role, isAdmin, isSelf }: { userId: string; role: string; isAdmin: boolean; isSelf: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  if (!isAdmin) {
    return (
      <span className={cn("shrink-0 rounded-md px-2 py-1 text-[11px] font-bold", role === "CUSTOMER" ? "bg-mist text-slate-600" : "bg-safety-50 text-safety-700")}>
        {role}
      </span>
    );
  }

  return (
    <span className="flex shrink-0 items-center gap-1.5">
      {err && <span className="text-[11px] font-semibold text-red-600">{err}</span>}
      <select
        defaultValue={role}
        disabled={busy || isSelf}
        title={isSelf ? "You cannot change your own role" : undefined}
        onChange={async (e) => {
          const next = e.target.value;
          if (!confirm(`Set this account's role to ${next.replace(/_/g, " ")}?`)) { e.target.value = role; return; }
          setBusy(true); setErr("");
          try {
            await setUserRole(userId, next);
            router.refresh();
          } catch (er: any) {
            setErr(er.message ?? "Failed.");
            e.target.value = role;
          }
          setBusy(false);
        }}
        className={cn(
          "rounded-md border px-2 py-1 text-[11px] font-bold",
          role === "CUSTOMER" ? "border-slate-200 bg-mist text-slate-600" : "border-safety-600/30 bg-safety-50 text-safety-700",
          isSelf && "cursor-not-allowed opacity-60"
        )}
      >
        {ROLES.map((r) => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
      </select>
    </span>
  );
}

export function CompanyCreditToggle({ companyId, approved, canApprove }: { companyId: string; approved: boolean; canApprove: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  if (!canApprove) {
    return (
      <span className={cn("shrink-0 rounded-md px-2 py-1 text-[11px] font-bold", approved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
        {approved ? "CREDIT OK" : "STANDARD"}
      </span>
    );
  }

  return (
    <span className="flex shrink-0 items-center gap-1.5">
      {err && <span className="text-[11px] font-semibold text-red-600">{err}</span>}
      <button
        disabled={busy}
        onClick={async () => {
          setBusy(true); setErr("");
          try {
            await setCompanyCredit(companyId, !approved);
            router.refresh();
          } catch (er: any) {
            setErr(er.message ?? "Failed.");
          }
          setBusy(false);
        }}
        className={cn(
          "rounded-md px-2.5 py-1 text-[11px] font-bold transition disabled:opacity-50",
          approved ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-amber-100 text-amber-700 hover:bg-amber-200"
        )}
        title={approved ? "Revoke credit approval" : "Approve LPO & 30-day terms"}
      >
        {busy ? "Working…" : approved ? "CREDIT OK — revoke" : "Approve credit"}
      </button>
    </span>
  );
}
