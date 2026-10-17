"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { markAllMessagesRead, setMessageRead } from "@/lib/admin-actions";

export function MessageRowActions({ id, read }: { id: string; read: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  return (
    <span className="flex shrink-0 items-center gap-1.5">
      {err && <span className="text-[11px] font-semibold text-red-600">{err}</span>}
      <button
        disabled={busy}
        onClick={async () => {
          setBusy(true); setErr("");
          try {
            await setMessageRead(id, !read);
            router.refresh();
          } catch (e: any) {
            setErr(e.message ?? "Failed.");
          }
          setBusy(false);
        }}
        className="rounded-lg bg-mist px-2.5 py-1.5 text-[11px] font-bold text-navy-950 hover:bg-safety-100 disabled:opacity-50"
      >
        {busy ? "…" : read ? "Mark unread" : "Mark read"}
      </button>
    </span>
  );
}

export function MarkAllReadButton({ count }: { count: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  return (
    <span className="flex items-center gap-2">
      {err && <span className="text-[11px] font-semibold text-red-600">{err}</span>}
      <button
        disabled={busy}
        onClick={async () => {
          if (!confirm(`Mark all ${count} unread message${count === 1 ? "" : "s"} as read?`)) return;
          setBusy(true); setErr("");
          try {
            await markAllMessagesRead();
            router.refresh();
          } catch (e: any) {
            setErr(e.message ?? "Failed.");
          }
          setBusy(false);
        }}
        className="rounded-xl bg-navy-950 px-4 py-2.5 text-[13px] font-bold text-white hover:bg-safety-600 disabled:opacity-50"
      >
        {busy ? "Marking…" : `Mark all read (${count})`}
      </button>
    </span>
  );
}
