import { saveProduct } from "@/lib/admin-actions";
import { db } from "@/lib/db";
import { inputCls, Field } from "@/components/ui";

export const dynamic = "force-dynamic";

async function ProductForm({ id }: { id?: string }) {
  let p: any = null;
  let cats: any[] = [];
  let brands: any[] = [];
  if (db) {
    try {
      cats = await db.category.findMany({ orderBy: { name: "asc" } });
      brands = await db.brand.findMany({ orderBy: { name: "asc" } });
      if (id) p = await db.product.findUnique({ where: { id }, include: { specifications: true, images: { orderBy: { sortOrder: "asc" } } } });
    } catch { /* ignore */ }
  }
  if (id && !p) return <p className="rounded-2xl bg-red-50 p-6 text-sm font-semibold text-red-600">Product not found.</p>;

  return (
    <form action={saveProduct} className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6">
      {p && <input type="hidden" name="id" value={p.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Product name *"><input name="name" required defaultValue={p?.name} className={inputCls} /></Field>
        <Field label="SKU *"><input name="sku" required defaultValue={p?.sku} className={inputCls} /></Field>
        <Field label="Slug *"><input name="slug" required defaultValue={p?.slug} className={inputCls} /></Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Price (KES) *"><input name="price" required type="number" step="1" min="1" defaultValue={p ? Number(p.price) : ""} className={inputCls} /></Field>
          <Field label="Was (KES)"><input name="compareAtPrice" type="number" step="1" defaultValue={p?.compareAtPrice ? Number(p.compareAtPrice) : ""} className={inputCls} /></Field>
          <Field label="Stock *"><input name="stock" required type="number" min="0" defaultValue={p?.stock ?? 0} className={inputCls} /></Field>
        </div>
        <Field label="Category">
          <select name="categoryId" defaultValue={p?.categoryId ?? ""} className={inputCls}>
            <option value="">— None —</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Brand">
          <select name="brandId" defaultValue={p?.brandId ?? ""} className={inputCls}>
            <option value="">— None —</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </Field>
        <Field label="Short description"><input name="shortDesc" defaultValue={p?.shortDesc ?? ""} className={inputCls} /></Field>
        <div className="grid grid-cols-3 gap-3">
          <label className="flex items-center gap-2 rounded-xl bg-mist p-3 text-sm font-semibold"><input type="checkbox" name="featured" defaultChecked={p?.featured} className="h-4 w-4 accent-safety-600" /> Featured</label>
          <label className="flex items-center gap-2 rounded-xl bg-mist p-3 text-sm font-semibold"><input type="checkbox" name="isNew" defaultChecked={p?.isNew} className="h-4 w-4 accent-safety-600" /> New</label>
          <label className="flex items-center gap-2 rounded-xl bg-mist p-3 text-sm font-semibold"><input type="checkbox" name="isActive" defaultChecked={p ? p.isActive : true} value="on" className="h-4 w-4 accent-safety-600" /> Active</label>
        </div>
      </div>
      <Field label="Full description"><textarea name="description" rows={5} defaultValue={p?.description ?? ""} className={inputCls} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Sizes (comma separated)"><input name="sizes" defaultValue={Array.isArray(p?.sizes) ? p.sizes.join(", ") : ""} className={inputCls} placeholder="M, L, XL" /></Field>
        <Field label="Colours (comma separated)"><input name="colours" defaultValue={Array.isArray(p?.colours) ? p.colours.join(", ") : ""} className={inputCls} placeholder="Yellow, White" /></Field>
      </div>
      <Field label="Specifications (one per line — Key: Value)" hint="Example: Standard: EN 397">
        <textarea name="specs" rows={5} defaultValue={p?.specifications?.map((s: any) => `${s.key}: ${s.value}`).join("\n") ?? ""} className={`${inputCls} font-mono text-[13px]`} />
      </Field>
      <Field label="Product images (one URL per line — first = primary)" hint="Example: /images/products/safety-boots.jpg — up to 10 images for the gallery">
        <textarea name="images" rows={3} defaultValue={p?.images?.map((im: any) => im.url).join("\n") ?? ""} placeholder="/images/products/example.jpg" className={`${inputCls} font-mono text-[13px]`} />
      </Field>
      <button className="rounded-xl bg-navy-950 py-3.5 text-sm font-extrabold uppercase text-white hover:bg-safety-600">
        {p ? "Save changes" : "Create product"}
      </button>
    </form>
  );
}

export default async function NewProductPage() {
  if (!db) return <p className="rounded-2xl bg-amber-50 p-6 text-sm font-semibold text-amber-800">Connect PostgreSQL to manage products.</p>;
  return (
    <div>
      <h2 className="mb-4 text-lg font-extrabold text-navy-950">New product</h2>
      <ProductForm />
    </div>
  );
}
