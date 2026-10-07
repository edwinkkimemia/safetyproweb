import { z } from "zod";
import { db } from "@/lib/db";

const orderSchema = z.object({
  customerName: z.string().min(2).max(120),
  company: z.string().max(160).optional().default(""),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  address: z.string().min(3).max(300),
  county: z.string().min(2).max(80),
  town: z.string().min(2).max(80),
  notes: z.string().max(2000).optional().default(""),
  paymentMethod: z.enum(["MPESA", "BANK", "COD", "LPO"]).default("MPESA"),
  items: z.array(z.object({
    slug: z.string(), name: z.string(), sku: z.string(),
    price: z.number().positive(), qty: z.number().int().min(1).max(999),
    size: z.string().optional(), colour: z.string().optional(),
  })).min(1).max(100),
});

function totals(items: { price: number; qty: number }[]) {
  const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0);
  const vatTotal = subtotal - subtotal / 1.16;
  const deliveryFee = subtotal >= 20000 ? 0 : 500;
  return { subtotal, vatTotal, deliveryFee, total: subtotal + deliveryFee };
}

// Simple in-memory rate limit (per instance)
const hits = new Map<string, { n: number; t: number }>();
function limited(ip: string): boolean {
  const now = Date.now();
  const h = hits.get(ip) ?? { n: 0, t: now };
  if (now - h.t > 60_000) { hits.set(ip, { n: 1, t: now }); return false; }
  h.n += 1; hits.set(ip, h);
  return h.n > 20;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  if (limited(`order:${ip}`)) return Response.json({ error: "Too many requests. Try again shortly." }, { status: 429 });

  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON." }, { status: 400 }); }
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Please check the form fields.", details: parsed.error.flatten() }, { status: 400 });

  const d = parsed.data;
  const t = totals(d.items);
  const orderNo = `SP-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const tx = db;
  if (tx) {
    try {
      const order = await tx.order.create({
        data: {
          orderNo, customerName: d.customerName, customerEmail: d.email.toLowerCase(),
          customerPhone: d.phone, companyName: d.company || null, address: d.address,
          county: d.county, town: d.town, notes: d.notes || null,
          subtotal: t.subtotal, vatTotal: t.vatTotal, deliveryFee: t.deliveryFee, total: t.total,
          paymentMethod: d.paymentMethod as any,
          items: {
            create: await Promise.all(d.items.map(async (i) => {
              const prod = await tx.product.findUnique({ where: { slug: i.slug } });
              return {
                productId: prod?.id ?? (await tx.product.findFirstOrThrow()).id,
                name: i.name, sku: i.sku, quantity: i.qty, unitPrice: i.price, subtotal: i.price * i.qty,
              };
            })),
          },
        },
      });
      return Response.json({ ok: true, orderNo: order.orderNo, total: t.total, persisted: true });
    } catch (e) {
      console.error("order persist failed, falling back:", e);
    }
  }
  // Fallback: ordering still works end-to-end (confirmation + WhatsApp) without DB
  return Response.json({ ok: true, orderNo, total: t.total, persisted: false });
}

export async function GET() {
  if (!db) return Response.json({ orders: [], note: "Database not configured." });
  try {
    const orders = await db.order.findMany({ orderBy: { createdAt: "desc" }, take: 50, include: { items: true } });
    return Response.json({ orders });
  } catch {
    return Response.json({ orders: [] }, { status: 500 });
  }
}
