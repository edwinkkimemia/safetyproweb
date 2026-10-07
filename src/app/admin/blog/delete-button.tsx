"use client";

import { useState } from "react";
import { deletePost } from "@/lib/admin-actions";

export function DeletePostButton({ id }: { id: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <button disabled={busy} onClick={async () => {
      if (!confirm("Delete this article?")) return;
      setBusy(true);
      try { await deletePost(id); } catch (e: any) { alert(e.message); setBusy(false); }
    }} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 disabled:opacity-50">
      Delete
    </button>
  );
}
