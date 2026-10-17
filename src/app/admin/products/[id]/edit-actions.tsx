"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Trash2 } from "lucide-react";
import { deleteProduct } from "@/lib/admin-actions";

export function EditProductActions({ id, name, slug, canDelete }: { id: string; name: string; slug: string; canDelete: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href={`/product/${slug}`} target="_blank" className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-navy-950 hover:border-safety-600 hover:text-safety-600">
        <ExternalLink size={15} /> View on storefront
      </Link>
      {canDelete ? (
        <button
          disabled={busy}
          onClick={async () => {
            if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
            setBusy(true); setErr("");
            try {
              await deleteProduct(id);
              router.push("/admin/products");
              router.refresh();
            } catch (e: any) {
              setErr(e.message ?? "Delete failed.");
              setBusy(false);
            }
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100 disabled:opacity-50"
        >
          <Trash2 size={15} /> {busy ? "Deleting…" : "Delete product"}
        </button>
      ) : (
        <span className="text-xs font-semibold text-slate-400">Delete requires ADMIN access</span>
      )}
      {err && <span className="text-xs font-semibold text-red-600">{err}</span>}
    </div>
  );
}
