import { z } from "zod";
import { db } from "@/lib/db";

const itemSchema = z.object({
  productId: z.string().optional(),
  name: z.string().min(1).max(200),
  quantity: z.number().int().min(1).max(100000),
  notes: z.string().max(1000).optional(),
});

const quoteSchema = z.object({
  companyName: z.string().min(2).max(160),
  contactPerson: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  industry: z.string().max(80).optional().default(""),
  deliveryLocation: z.string().max(200).optional().default(""),
  deliveryDate: z.string().optional().default(""),
  notes: z.string().max(4000).optional().default(""),
  employeeSizes: z.string().max(2000).optional().default(""),
  specs: z.string().max(2000).optional().default(""),
  brands: z.string().max(500).optional().default(""),
  items: z.array(itemSchema).max(200).default([]),
  document: z.object({
    filename: z.string().max(200),
    mimeType: z.string().max(120),
    size: z.number().max(8 * 1024 * 1024),
    url: z.string().max(2000).default(""),
  }).optional(),
});

const hits = new Map<string, { n: number; t: number }>();
function limited(ip: string): boolean {
  const now = Date.now();
  const h = hits.get(ip) ?? { n: 0, t: now };
  if (now - h.t > 60_000) { hits.set(ip, { n: 1, t: now }); return false; }
  h.n += 1; hits.set(ip, h);
  return h.n > 15;
}

const ALLOWED_DOCS = [
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  if (limited(`quote:${ip}`)) return Response.json({ error: "Too many requests. Try again shortly." }, { status: 429 });

  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON." }, { status: 400 }); }
  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Please check the form fields.", details: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;

  if (d.document && !ALLOWED_DOCS.includes(d.document.mimeType)) {
    return Response.json({ error: "Only Excel, CSV, PDF or Word files are accepted." }, { status: 400 });
  }

  const quoteNo = `Q-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const tx = db;
  if (tx) {
    try {
      const q = await tx.quotation.create({
        data: {
          quoteNo, companyName: d.companyName, contactPerson: d.contactPerson,
          email: d.email.toLowerCase(), phone: d.phone, industry: d.industry || null,
          deliveryLoc: d.deliveryLocation || null,
          deliveryDate: d.deliveryDate ? new Date(d.deliveryDate) : null,
          notes: d.notes || null, employeeSizes: d.employeeSizes || null,
          specs: d.specs || null, brands: d.brands || null,
          items: {
            create: await Promise.all(d.items.map(async (i) => {
              const prod = i.productId ? await tx.product.findUnique({ where: { id: i.productId } }) : null;
              return { productId: prod?.id ?? null, name: i.name, quantity: i.quantity, notes: i.notes ?? null };
            })),
          },
          ...(d.document ? {
            documents: {
              create: {
                filename: d.document.filename, mimeType: d.document.mimeType,
                size: d.document.size, url: d.document.url || `uploads/${quoteNo}/${d.document.filename}`,
              },
            },
          } : {}),
        },
      });
      return Response.json({ ok: true, quoteNo: q.quoteNo, persisted: true });
    } catch (e) {
      console.error("quotation persist failed:", e);
    }
  }
  return Response.json({ ok: true, quoteNo, persisted: false });
}
