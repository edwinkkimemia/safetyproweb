import { savePost } from "@/lib/admin-actions";
import { db } from "@/lib/db";
import { inputCls, Field } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!db) return <p className="rounded-2xl bg-amber-50 p-6 text-sm font-semibold text-amber-800">Connect PostgreSQL to manage articles.</p>;
  let post: any = null;
  try { post = await db.blogPost.findUnique({ where: { id } }); } catch { /* ignore */ }
  if (!post) return <p className="rounded-2xl bg-red-50 p-6 text-sm font-semibold text-red-600">Article not found.</p>;
  return (
    <div>
      <h2 className="mb-4 text-lg font-extrabold text-navy-950">Edit article</h2>
      <form action={savePost} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6">
        <input type="hidden" name="id" value={post.id} />
        <Field label="Title *"><input name="title" required defaultValue={post.title} className={inputCls} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Slug *"><input name="slug" required defaultValue={post.slug} className={inputCls} /></Field>
          <Field label="Excerpt"><input name="excerpt" defaultValue={post.excerpt ?? ""} className={inputCls} /></Field>
        </div>
        <Field label="Content *"><textarea name="content" required rows={12} defaultValue={post.content} className={inputCls} /></Field>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 rounded-xl bg-mist px-4 py-3 text-sm font-semibold"><input type="checkbox" name="published" defaultChecked={post.published} className="h-4 w-4 accent-safety-600" /> Published</label>
          <label className="flex items-center gap-2 rounded-xl bg-mist px-4 py-3 text-sm font-semibold"><input type="checkbox" name="featured" defaultChecked={post.featured} className="h-4 w-4 accent-safety-600" /> Featured</label>
        </div>
        <button className="rounded-xl bg-navy-950 py-3.5 text-sm font-extrabold uppercase text-white hover:bg-safety-600">Save changes</button>
      </form>
    </div>
  );
}
