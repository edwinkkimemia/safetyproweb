import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { DeletePostButton } from "./delete-button";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  let posts: any[] = [];
  if (db) {
    try { posts = await db.blogPost.findMany({ orderBy: { updatedAt: "desc" }, include: { category: true } }); } catch { /* demo */ }
  }
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-navy-950">Blog articles ({posts.length})</h2>
        <Link href="/admin/blog/new" className="inline-flex items-center gap-1.5 rounded-xl bg-navy-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-safety-600"><Plus size={16} /> New article</Link>
      </div>
      {posts.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          No articles in the database yet. Run the seed script or create one — the site shows built-in guides meanwhile.
        </p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {posts.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-sm last:border-0">
              <div><p className="font-bold text-navy-950">{p.title}</p><p className="text-xs text-slate-500">/{p.slug} • {p.published ? "Published" : "Draft"}{p.featured ? " • Featured" : ""}</p></div>
              <span className="flex shrink-0 gap-2">
                <Link href={`/admin/blog/${p.id}`} className="rounded-lg bg-mist px-3 py-1.5 text-xs font-bold hover:bg-safety-100">Edit</Link>
                <DeletePostButton id={p.id} />
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
