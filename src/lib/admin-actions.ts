"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const STAFF = ["SUPER_ADMIN", "ADMIN", "SALES", "PROCUREMENT", "INVENTORY"];
// Destructive / privileged ops (delete, pricing, staff accounts) are admin-only.
const ADMINS = ["SUPER_ADMIN", "ADMIN"];

export async function requireStaff() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || !STAFF.includes(role)) throw new Error("Unauthorized — staff only.");
  return session;
}

export async function requireAdmin() {
  const session = await requireStaff();
  const role = (session?.user as any)?.role;
  if (!ADMINS.includes(role)) throw new Error("Unauthorized — admins only. Ask a SUPER_ADMIN for access.");
  return session;
}

function requireDb() {
  if (!db) throw new Error("This action is temporarily unavailable. Please try again later.");
  return db;
}

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(220),
  sku: z.string().min(2).max(60),
  price: z.coerce.number().positive(),
  compareAtPrice: z.coerce.number().optional(),
  stock: z.coerce.number().int().min(0),
  shortDesc: z.string().max(500).default(""),
  description: z.string().max(20000).default(""),
  categoryId: z.string().optional().default(""),
  brandId: z.string().optional().default(""),
  featured: z.coerce.boolean().default(false),
  isNew: z.coerce.boolean().default(false),
  isActive: z.coerce.boolean().default(true),
  sizes: z.string().default(""),
  colours: z.string().default(""),
  specs: z.string().default(""), // lines of "Key: Value"
  images: z.string().default(""), // one image URL per line, first = primary
});

export async function saveProduct(form: FormData): Promise<void> {
  await requireStaff();
  const tx = requireDb();
  const raw = Object.fromEntries(form.entries());
  const parsed = productSchema.safeParse({ ...raw, featured: form.get("featured") === "on", isNew: form.get("isNew") === "on", isActive: form.get("isActive") === "on" });
  if (!parsed.success) throw new Error("Check product fields: " + parsed.error.issues[0]?.message);
  const d = parsed.data;
  const data = {
    name: d.name, slug: d.slug.toLowerCase().trim().replace(/\s+/g, "-"), sku: d.sku,
    price: d.price, compareAtPrice: d.compareAtPrice || null, stock: d.stock,
    shortDesc: d.shortDesc, description: d.description,
    categoryId: d.categoryId || null, brandId: d.brandId || null,
    featured: d.featured, isNew: d.isNew, isActive: d.isActive,
    sizes: d.sizes.split(",").map((s) => s.trim()).filter(Boolean),
    colours: d.colours.split(",").map((s) => s.trim()).filter(Boolean),
  };
  const specs = d.specs.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
    const [k, ...rest] = l.split(":");
    return { key: k.trim(), value: rest.join(":").trim() };
  }).filter((s) => s.key && s.value);
  const imageUrls = d.images.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 10);

  let id = d.id;
  if (id) {
    await tx.product.update({ where: { id }, data });
    await tx.productSpecification.deleteMany({ where: { productId: id } });
  } else {
    const created = await tx.product.create({ data });
    id = created.id;
  }
  for (const s of specs) await tx.productSpecification.create({ data: { productId: id, ...s } });
  if (imageUrls.length || d.id) {
    await tx.productImage.deleteMany({ where: { productId: id } });
    for (const [i, url] of imageUrls.entries()) {
      await tx.productImage.create({ data: { productId: id, url, alt: d.name, sortOrder: i } });
    }
  }
  revalidatePath("/shop");
  revalidatePath("/admin/products");
  revalidatePath(`/product/${data.slug}`);
  return;
}

export async function deleteProduct(id: string): Promise<void> {
  await requireAdmin();
  const tx = requireDb();
  await tx.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return;
}

// ---------- Bulk / quick product ops (admin-only) ----------

function revalidateProductViews() {
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
}

export type BulkResult = { updated: number; skipped: number; errors: string[] };

export async function bulkUpdateProducts(ids: string[], op: string, value: string): Promise<BulkResult> {
  await requireAdmin();
  const tx = requireDb();
  const res: BulkResult = { updated: 0, skipped: 0, errors: [] };
  if (!ids.length) { res.errors.push("Select at least one product."); return res; }

  const num = Number(value);
  switch (op) {
    case "activate":
    case "deactivate":
    case "feature":
    case "unfeature": {
      const data = op === "activate" ? { isActive: true } : op === "deactivate" ? { isActive: false } : op === "feature" ? { featured: true } : { featured: false };
      const r = await tx.product.updateMany({ where: { id: { in: ids } }, data });
      res.updated = r.count;
      break;
    }
    case "setPrice":
    case "priceUpPct":
    case "priceDownPct": {
      if (!Number.isFinite(num) || num <= 0) { res.errors.push("Enter a positive number."); return res; }
      if (op === "setPrice") {
        const r = await tx.product.updateMany({ where: { id: { in: ids } }, data: { price: num } });
        res.updated = r.count;
      } else {
        const rows = await tx.product.findMany({ where: { id: { in: ids } }, select: { id: true, price: true } });
        const factor = op === "priceUpPct" ? 1 + num / 100 : 1 - num / 100;
        for (const r of rows) {
          const next = Math.max(1, Math.round(Number(r.price) * factor));
          await tx.product.update({ where: { id: r.id }, data: { price: next } });
          res.updated++;
        }
      }
      break;
    }
    case "setStock": {
      if (!Number.isInteger(num) || num < 0) { res.errors.push("Stock must be a whole number ≥ 0."); return res; }
      const r = await tx.product.updateMany({ where: { id: { in: ids } }, data: { stock: num } });
      res.updated = r.count;
      break;
    }
    case "stockDelta": {
      if (!Number.isInteger(num)) { res.errors.push("Enter a whole number (use negative to reduce)."); return res; }
      const rows = await tx.product.findMany({ where: { id: { in: ids } }, select: { id: true, stock: true } });
      for (const r of rows) {
        await tx.product.update({ where: { id: r.id }, data: { stock: Math.max(0, r.stock + num) } });
        res.updated++;
      }
      break;
    }
    default:
      throw new Error("Unknown bulk action.");
  }
  revalidateProductViews();
  return res;
}

// Quick inline edit from the product list — price and/or stock in one call.
export async function updateProductQuick(id: string, price: string, stock: string): Promise<{ errors: string[] }> {
  await requireStaff();
  const tx = requireDb();
  const data: { price?: number; stock?: number } = {};
  if (price.trim()) {
    const p = Number(price);
    if (!Number.isFinite(p) || p <= 0) return { errors: ["Enter a valid price above 0."] };
    data.price = p;
  }
  if (stock.trim()) {
    const s = Number(stock);
    if (!Number.isInteger(s) || s < 0) return { errors: ["Stock must be a whole number 0 or more."] };
    data.stock = s;
  }
  if (Object.keys(data).length === 0) return { errors: ["Nothing to update."] };
  await tx.product.update({ where: { id }, data });
  revalidateProductViews();
  return { errors: [] };
}

export async function bulkDeleteProducts(ids: string[]): Promise<BulkResult> {
  await requireAdmin();
  const tx = requireDb();
  const res: BulkResult = { updated: 0, skipped: 0, errors: [] };
  if (!ids.length) { res.errors.push("Select at least one product."); return res; }
  const r = await tx.product.deleteMany({ where: { id: { in: ids } } });
  res.updated = r.count;
  revalidateProductViews();
  return res;
}

export async function setOrderStatus(id: string, status: string): Promise<void> {
  await requireStaff();
  const tx = requireDb();
  await tx.order.update({ where: { id }, data: { status: status as any } });
  revalidatePath("/admin/orders");
  return;
}

export async function setOrderPaymentStatus(id: string, paymentStatus: string): Promise<void> {
  await requireStaff();
  const tx = requireDb();
  const ALLOWED = ["PENDING", "PAID", "FAILED", "REFUNDED"];
  if (!ALLOWED.includes(paymentStatus)) throw new Error("Unknown payment status.");
  await tx.order.update({ where: { id }, data: { paymentStatus: paymentStatus as any } });
  revalidatePath("/admin/orders");
  return;
}

export async function setQuotationStatus(id: string, status: string, quotedTotal?: number): Promise<void> {
  await requireStaff();
  const tx = requireDb();
  await tx.quotation.update({ where: { id }, data: { status: status as any, quotedTotal: quotedTotal ?? undefined } });
  revalidatePath("/admin/quotations");
  return;
}

const settingsSchema = z.object({
  phone: z.string().max(30), whatsapp: z.string().max(20),
  email: z.string().email(), address: z.string().max(300),
  mpesaPaybill: z.string().max(30),
});

export async function saveSettings(form: FormData): Promise<void> {
  await requireStaff();
  const tx = requireDb();
  const parsed = settingsSchema.safeParse(Object.fromEntries(form.entries()));
  if (!parsed.success) throw new Error("Check settings fields.");
  await tx.siteSettings.upsert({ where: { id: 1 }, update: parsed.data, create: { id: 1, ...parsed.data } });
  revalidatePath("/");
  return;
}

const postSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(4).max(200),
  slug: z.string().min(2).max(220),
  excerpt: z.string().max(500).default(""),
  content: z.string().min(20),
  published: z.boolean().default(true),
  featured: z.boolean().default(false),
});

export async function savePost(form: FormData): Promise<void> {
  await requireStaff();
  const tx = requireDb();
  const parsed = postSchema.safeParse({
    id: (form.get("id") as string) || undefined,
    title: form.get("title"), slug: form.get("slug"), excerpt: form.get("excerpt"),
    content: form.get("content"), published: form.get("published") === "on", featured: form.get("featured") === "on",
  });
  if (!parsed.success) throw new Error("Check article fields.");
  const d = parsed.data;
  const slug = d.slug.toLowerCase().trim().replace(/\s+/g, "-");
  if (d.id) await tx.blogPost.update({ where: { id: d.id }, data: { ...d, slug } });
  else await tx.blogPost.create({ data: { ...d, slug } });
  revalidatePath("/resources");
  revalidatePath("/admin/blog");
  return;
}

export async function deletePost(id: string): Promise<void> {
  await requireAdmin();
  const tx = requireDb();
  await tx.blogPost.delete({ where: { id } });
  revalidatePath("/admin/blog");
  revalidatePath("/resources");
  return;
}

// ---------- Customers / companies (admin-only) ----------

export async function setUserRole(userId: string, role: string): Promise<void> {
  const session = await requireAdmin();
  const tx = requireDb();
  const ROLES = ["SUPER_ADMIN", "ADMIN", "SALES", "PROCUREMENT", "INVENTORY", "CUSTOMER"];
  if (!ROLES.includes(role)) throw new Error("Unknown role.");
  const me = (session.user as any).id;
  if (userId === me && role !== "SUPER_ADMIN") throw new Error("You cannot downgrade your own account. Ask another SUPER_ADMIN.");
  const target = await tx.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!target) throw new Error("User not found.");
  if (target.role === "SUPER_ADMIN" && role !== "SUPER_ADMIN") {
    const supers = await tx.user.count({ where: { role: "SUPER_ADMIN" } });
    if (supers <= 1) throw new Error("Cannot downgrade the only SUPER_ADMIN.");
  }
  await tx.user.update({ where: { id: userId }, data: { role: role as any } });
  revalidatePath("/admin/customers");
  return;
}

export async function setCompanyCredit(companyId: string, approved: boolean): Promise<void> {
  await requireAdmin();
  const tx = requireDb();
  await tx.company.update({ where: { id: companyId }, data: { creditApproved: approved } });
  revalidatePath("/admin/customers");
  return;
}

// ---------- Messages ----------

export async function setMessageRead(id: string, read: boolean): Promise<void> {
  await requireStaff();
  const tx = requireDb();
  await tx.contactMessage.update({ where: { id }, data: { read } });
  revalidatePath("/admin/messages");
  return;
}

export async function markAllMessagesRead(): Promise<void> {
  await requireStaff();
  const tx = requireDb();
  await tx.contactMessage.updateMany({ where: { read: false }, data: { read: true } });
  revalidatePath("/admin/messages");
  return;
}
