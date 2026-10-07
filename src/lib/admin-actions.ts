"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const STAFF = ["SUPER_ADMIN", "ADMIN", "SALES", "PROCUREMENT", "INVENTORY"];

export async function requireStaff() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || !STAFF.includes(role)) throw new Error("Unauthorized — staff only.");
  return session;
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
  const tx = db;
  if (!tx) throw new Error("Database not connected.");
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
  await requireStaff();
  const tx = db;
  if (!tx) throw new Error("Database not connected.");
  await tx.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  return;
}

export async function setOrderStatus(id: string, status: string): Promise<void> {
  await requireStaff();
  const tx = db;
  if (!tx) throw new Error("Database not connected.");
  await tx.order.update({ where: { id }, data: { status: status as any } });
  revalidatePath("/admin/orders");
  return;
}

export async function setQuotationStatus(id: string, status: string, quotedTotal?: number): Promise<void> {
  await requireStaff();
  const tx = db;
  if (!tx) throw new Error("Database not connected.");
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
  const tx = db;
  if (!tx) throw new Error("Database not connected.");
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
  const tx = db;
  if (!tx) throw new Error("Database not connected.");
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
  await requireStaff();
  const tx = db;
  if (!tx) throw new Error("Database not connected.");
  await tx.blogPost.delete({ where: { id } });
  revalidatePath("/admin/blog");
  return;
}
